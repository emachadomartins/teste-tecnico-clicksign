package utils

import (
	"mime"
	"testing"
)

func TestDetectFileExtension(t *testing.T) {
	t.Run("extensões preferidas", func(t *testing.T) {
		tests := map[string]string{
			"image/jpeg":      ".jpg",
			"image/png":       ".png",
			"image/gif":       ".gif",
			"image/webp":      ".webp",
			"application/pdf": ".pdf",
		}
		for contentType, want := range tests {
			if got := DetectFileExtension(contentType); got != want {
				t.Errorf("DetectFileExtension(%q) = %q, want %q", contentType, got, want)
			}
		}
	})

	t.Run("tipo fora da lista usa a extensão do sistema", func(t *testing.T) {
		if got := DetectFileExtension("text/html"); mime.TypeByExtension(got) == "" {
			t.Errorf("DetectFileExtension(text/html) = %q, want a known extension", got)
		}
	})

	t.Run("extensão corresponde ao tipo", func(t *testing.T) {
		for _, contentType := range []string{"image/jpeg", "image/png"} {
			ext := DetectFileExtension(contentType)
			if ext == "" {
				t.Fatalf("DetectFileExtension(%q) returned no extension", contentType)
			}
			if got := mime.TypeByExtension(ext); got != contentType {
				t.Errorf("extension %q of %q maps back to %q", ext, contentType, got)
			}
		}
	})

	t.Run("ignora parâmetros do tipo", func(t *testing.T) {
		if got := DetectFileExtension("image/png; charset=binary"); got != ".png" {
			t.Errorf("got %q, want .png", got)
		}
	})

	t.Run("tipo desconhecido", func(t *testing.T) {
		if got := DetectFileExtension("application/x-tipo-inexistente"); got != "" {
			t.Errorf("got %q, want empty string", got)
		}
	})

	t.Run("tipo inválido", func(t *testing.T) {
		if got := DetectFileExtension("não é um tipo"); got != "" {
			t.Errorf("got %q, want empty string", got)
		}
	})
}
