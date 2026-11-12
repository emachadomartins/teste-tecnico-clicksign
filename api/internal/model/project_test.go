package model

import "testing"

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
		})
	}
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
