package handler

import (
	"encoding/json"
	"errors"
	"gerenciador-de-projetos-back/internal/utils"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

var errInvalidID = errors.New("invalid project id")

type ResultMetadata struct {
	Total int `json:"total,omitempty"`
}

type Result[T any] struct {
	Data     T              `json:"data"`
	Metadata ResultMetadata `json:"metadata,omitzero"`
	Error    string         `json:"error,omitempty"`
}

func decodeBodyJson[T any](r *http.Request) (T, error) {
	var payload T
	err := json.NewDecoder(r.Body).Decode(&payload)
	return payload, err
}

func parseIDFromRequest(r *http.Request) (uuid.UUID, error) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		return uuid.Nil, errInvalidID
	}

	return id, nil
}

func respondJSON[T any](w http.ResponseWriter, status int, response Result[T], logger *utils.LoggerImpl) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		logger.Error("error writing response: %v", err)
	}
}

func respondSingle[T any](w http.ResponseWriter, status int, item T, logger *utils.LoggerImpl) {
	respondJSON(w, status, Result[T]{Data: item}, logger)
}

func respondList[T any](w http.ResponseWriter, items []T, logger *utils.LoggerImpl) {
	logger.Info("Responding with list of %d items", len(items))

	response := Result[[]T]{
		Data: items,
		Metadata: ResultMetadata{
			Total: len(items),
		},
	}

	respondJSON(w, http.StatusOK, response, logger)
}

func respondError(w http.ResponseWriter, status int, err error, logger *utils.LoggerImpl) {
	logger.Error(err.Error())
	respondJSON(w, status, Result[any]{Error: err.Error()}, logger)
}

type HandlerImpl struct {
	Path   string
	logger *utils.LoggerImpl
}

func NewHandler(path string) *HandlerImpl {
	var p string
	if path[0] == '/' {
		p = path
	} else {
		p = "/" + path
	}

	l := utils.NewLogger(p)

	return &HandlerImpl{
		Path:   p,
		logger: l,
	}
}
