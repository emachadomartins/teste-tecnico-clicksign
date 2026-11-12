package model

import (
	"errors"
	"testing"
)

func validProject(t *testing.T) ProjectModel {
	t.Helper()
	return ProjectModel{
		BaseModel:   NewBaseModel(),
		Name:        "Projeto Exemplo",
		Client:      "Cliente Exemplo",
		InitialDate: mustDate(t, "2026-11-10"),
		FinalDate:   mustDate(t, "2026-11-30"),
	}
}

func TestProjectModelValidate(t *testing.T) {
	tests := []struct {
		name    string
		modify  func(p *ProjectModel)
		wantErr bool
	}{
		{"projeto válido", func(p *ProjectModel) {}, false},
		{"datas iguais", func(p *ProjectModel) { p.FinalDate = p.InitialDate }, false},
		{"sem nome", func(p *ProjectModel) { p.Name = "" }, true},
		{"sem cliente", func(p *ProjectModel) { p.Client = "" }, true},
		{"sem data inicial", func(p *ProjectModel) { p.InitialDate = Date{} }, true},
		{"sem data final", func(p *ProjectModel) { p.FinalDate = Date{} }, true},
		{"data inicial depois da final", func(p *ProjectModel) {
			p.InitialDate = mustDate(t, "2026-12-01")
		}, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p := validProject(t)
			tt.modify(&p)

			err := p.Validate()
			if tt.wantErr && err == nil {
				t.Error("expected error, got nil")
			}
			if !tt.wantErr && err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			var validationErr *ValidationError
			if tt.wantErr && !errors.As(err, &validationErr) {
				t.Errorf("expected a *ValidationError, got %T", err)
			}
		})
	}
}

func TestProjectPayloadRequiredFieldsError(t *testing.T) {
	name, client := "Projeto", "Cliente"
	initial, final := mustDate(t, "2026-11-10"), mustDate(t, "2026-11-30")

	t.Run("todos os campos enviados", func(t *testing.T) {
		p := ProjectPayload{Name: &name, Client: &client, InitialDate: &initial, FinalDate: &final}
		if err := p.RequiredFieldsError(); err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})

	t.Run("lista os campos ausentes", func(t *testing.T) {
		p := ProjectPayload{Name: &name, FinalDate: &final}

		err := p.RequiredFieldsError()

		var validationErr *ValidationError
		if !errors.As(err, &validationErr) {
			t.Fatalf("expected a *ValidationError, got %v", err)
		}
		want := "missing required fields: client, initial_date"
		if validationErr.Message != want {
			t.Errorf("message = %q, want %q", validationErr.Message, want)
		}
	})

	t.Run("payload vazio", func(t *testing.T) {
		err := ProjectPayload{}.RequiredFieldsError()
		want := "missing required fields: name, client, initial_date, final_date"
		if err == nil || err.Error() != want {
			t.Errorf("got %v, want %q", err, want)
		}
	})
}

func TestSortBy(t *testing.T) {
	known := map[string]SortBy{
		"name":         SortByName,
		"initial_date": SortByInitialDate,
		"final_date":   SortByFinalDate,
	}

	for text, sort := range known {
		t.Run(text, func(t *testing.T) {
			if got := ToSortBy(text); got != sort {
				t.Errorf("ToSortBy(%q) = %v, want %v", text, got, sort)
			}
			if got := sort.String(); got != text {
				t.Errorf("%v.String() = %q, want %q", sort, got, text)
			}
		})
	}

	t.Run("valor desconhecido usa a ordenação por nome", func(t *testing.T) {
		for _, text := range []string{"", "xyz", "NAME"} {
			if got := ToSortBy(text); got != SortByName {
				t.Errorf("ToSortBy(%q) = %v, want SortByName", text, got)
			}
		}
	})

	t.Run("String de um valor fora da lista", func(t *testing.T) {
		if got := SortBy(99).String(); got != "unknown" {
			t.Errorf("got %q, want unknown", got)
		}
	})
}
