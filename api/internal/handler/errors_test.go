package handler

import (
	"errors"
	"fmt"
	"gerenciador-de-projetos-back/internal/model"
	"gerenciador-de-projetos-back/internal/storage"
	"io/fs"
	"net/http"
	"testing"
)

func TestErrorStatus(t *testing.T) {
	tests := []struct {
		name        string
		err         error
		wantStatus  int
		wantMessage string
	}{
		{"validação", model.NewValidationError("Name is required"), http.StatusBadRequest, "Name is required"},
		{"validação embrulhada", fmt.Errorf("create: %w", model.NewValidationError("Client is required")), http.StatusBadRequest, "Client is required"},
		{"tipo de arquivo inválido", fmt.Errorf("%w: text/plain", storage.ErrInvalidContentType), http.StatusBadRequest, "cover must be a JPEG or PNG image"},
		{"arquivo grande demais", &http.MaxBytesError{Limit: 5 << 20}, http.StatusRequestEntityTooLarge, "cover must be at most 5 MB"},
		{"projeto não encontrado", model.ErrNotFound, http.StatusNotFound, "project not found"},
		{"projeto sem capa", model.ErrNoCover, http.StatusNotFound, "project has no cover"},
		{"arquivo da capa ausente no disco", fs.ErrNotExist, http.StatusNotFound, "project has no cover"},
		{"erro inesperado", errors.New("connection refused"), http.StatusInternalServerError, "internal server error"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, message := errorStatus(tt.err)
			if status != tt.wantStatus {
				t.Errorf("status = %d, want %d", status, tt.wantStatus)
			}
			if message != tt.wantMessage {
				t.Errorf("message = %q, want %q", message, tt.wantMessage)
			}
		})
	}
}
