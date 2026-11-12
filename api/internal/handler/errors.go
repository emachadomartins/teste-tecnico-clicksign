package handler

import (
	"errors"
	"gerenciador-de-projetos-back/internal/model"
	"gerenciador-de-projetos-back/internal/storage"
	"gerenciador-de-projetos-back/internal/utils"
	"io/fs"
	"net/http"
)

func errorStatus(err error) (int, string) {
	var validationErr *model.ValidationError
	var maxBytesErr *http.MaxBytesError

	switch {
	case errors.As(err, &validationErr):
		return http.StatusBadRequest, validationErr.Message
	case errors.Is(err, storage.ErrInvalidContentType):
		return http.StatusBadRequest, "cover must be a JPEG or PNG image"
	case errors.As(err, &maxBytesErr):
		return http.StatusRequestEntityTooLarge, "cover must be at most 5 MB"
	case errors.Is(err, model.ErrNotFound):
		return http.StatusNotFound, model.ErrNotFound.Error()
	case errors.Is(err, model.ErrNoCover), errors.Is(err, fs.ErrNotExist):
		return http.StatusNotFound, model.ErrNoCover.Error()
	default:
		return http.StatusInternalServerError, "internal server error"
	}
}

func respondServiceError(w http.ResponseWriter, err error, logger *utils.LoggerImpl) {
	status, message := errorStatus(err)
	if status == http.StatusInternalServerError {
		logger.Error("%s", err)
	}
	respondError(w, status, errors.New(message), logger)
}
