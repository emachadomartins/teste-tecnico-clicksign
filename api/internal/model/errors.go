package model

import "errors"

var (
	ErrNotFound = errors.New("project not found")
	ErrNoCover  = errors.New("project has no cover")
)

type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}

func NewValidationError(message string) error {
	return &ValidationError{Message: message}
}
