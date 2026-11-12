package model

import (
	"encoding/json"
	"testing"
	"time"
)

func mustDate(t *testing.T, s string) Date {
	t.Helper()
	parsed, err := time.Parse(time.DateOnly, s)
	if err != nil {
		t.Fatalf("invalid test date %q: %v", s, err)
	}
	return Date{parsed}
}

func TestDateUnmarshalJSON(t *testing.T) {
	t.Run("data válida", func(t *testing.T) {
		var d Date
		if err := json.Unmarshal([]byte(`"2026-11-11"`), &d); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if got := d.Format(time.DateOnly); got != "2026-11-11" {
			t.Errorf("got %q, want 2026-11-11", got)
		}
	})

	t.Run("formato inválido", func(t *testing.T) {
		for _, input := range []string{`"11/11/2026"`, `"2026-13-01"`, `"amanhã"`} {
			var d Date
			if err := json.Unmarshal([]byte(input), &d); err == nil {
				t.Errorf("expected error for %s", input)
			}
		}
	})

	t.Run("null e vazio resultam em data zerada", func(t *testing.T) {
		for _, input := range []string{`null`, `""`} {
			var d Date
			if err := json.Unmarshal([]byte(input), &d); err != nil {
				t.Errorf("unexpected error for %s: %v", input, err)
			}
			if !d.IsZero() {
				t.Errorf("expected zero date for %s, got %v", input, d)
			}
		}
	})
}

func TestDateMarshalJSON(t *testing.T) {
	t.Run("data preenchida", func(t *testing.T) {
		got, err := json.Marshal(mustDate(t, "2026-11-11"))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if string(got) != `"2026-11-11"` {
			t.Errorf("got %s, want \"2026-11-11\"", got)
		}
	})

	t.Run("data zerada vira null", func(t *testing.T) {
		got, err := json.Marshal(Date{})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if string(got) != "null" {
			t.Errorf("got %s, want null", got)
		}
	})

	t.Run("ida e volta", func(t *testing.T) {
		var d Date
		if err := json.Unmarshal([]byte(`"2026-02-28"`), &d); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		got, err := json.Marshal(d)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if string(got) != `"2026-02-28"` {
			t.Errorf("got %s, want \"2026-02-28\"", got)
		}
	})
}

func TestDateValue(t *testing.T) {
	t.Run("data zerada vira nil", func(t *testing.T) {
		got, err := Date{}.Value()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if got != nil {
			t.Errorf("got %v, want nil", got)
		}
	})

	t.Run("data preenchida vira time.Time", func(t *testing.T) {
		d := mustDate(t, "2026-11-11")
		got, err := d.Value()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		value, ok := got.(time.Time)
		if !ok {
			t.Fatalf("got %T, want time.Time", got)
		}
		if !value.Equal(d.Time) {
			t.Errorf("got %v, want %v", value, d.Time)
		}
	})
}

func TestDateScan(t *testing.T) {
	t.Run("nil resulta em data zerada", func(t *testing.T) {
		d := mustDate(t, "2026-11-11")
		if err := d.Scan(nil); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !d.IsZero() {
			t.Errorf("expected zero date, got %v", d)
		}
	})

	t.Run("time.Time", func(t *testing.T) {
		want := time.Date(2026, 11, 11, 0, 0, 0, 0, time.UTC)
		var d Date
		if err := d.Scan(want); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !d.Equal(want) {
			t.Errorf("got %v, want %v", d.Time, want)
		}
	})

	t.Run("tipo inválido", func(t *testing.T) {
		var d Date
		if err := d.Scan("2026-11-11"); err == nil {
			t.Error("expected error when scanning a string")
		}
	})

	t.Run("ida e volta com Value", func(t *testing.T) {
		original := mustDate(t, "2026-11-11")
		value, err := original.Value()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		var scanned Date
		if err := scanned.Scan(value); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !scanned.Equal(original.Time) {
			t.Errorf("got %v, want %v", scanned.Time, original.Time)
		}
	})
}
