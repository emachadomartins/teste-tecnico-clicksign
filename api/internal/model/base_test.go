package model

import (
	"testing"

	"github.com/google/uuid"
)

func TestNewBaseModel(t *testing.T) {
	first := NewBaseModel()
	second := NewBaseModel()

	if first.ID == uuid.Nil {
		t.Error("expected a non-empty ID")
	}
	if first.ID == second.ID {
		t.Error("expected different IDs for each call")
	}
	if first.CreatedAt.IsZero() || first.UpdatedAt.IsZero() {
		t.Error("expected CreatedAt and UpdatedAt to be set")
	}
}
