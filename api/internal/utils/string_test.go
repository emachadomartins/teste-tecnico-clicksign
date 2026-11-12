package utils

import (
	"slices"
	"testing"
)

func TestNormalizeWord(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{"remove acentos", "Cachaça", "cachaca"},
		{"converte para minúsculas", "ETANOL", "etanol"},
		{"acentos e maiúsculas juntos", "DÉCIMO", "decimo"},
		{"til", "Não", "nao"},
		{"sem alteração", "pinga", "pinga"},
		{"string vazia", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := NormalizeWord(tt.input); got != tt.want {
				t.Errorf("NormalizeWord(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func TestWordToTerms(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  []string
	}{
		{"uma palavra", "Etanol", []string{"etanol"}},
		{"várias palavras", "Etanol Pinga", []string{"etanol", "pinga"}},
		{"espaços duplicados e nas pontas", "  Etanol   Pinga  ", []string{"etanol", "pinga"}},
		{"normaliza cada palavra", "Décimo Cachaça", []string{"decimo", "cachaca"}},
		{"texto vazio", "", []string{}},
		{"só espaços", "   ", []string{}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WordToTerms(tt.input); !slices.Equal(got, tt.want) {
				t.Errorf("WordToTerms(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}
