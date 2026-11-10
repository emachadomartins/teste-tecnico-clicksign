package handler

import (
	"encoding/json"
	"fmt"
	"gerenciador-de-projetos-back/internal/utils"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

type ResultMetadata struct {
	Total int `json:"total,omitempty"`
	Page  int `json:"page,omitempty"`
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
	q := chi.URLParam(r, "id")
	if q == "" {
		return uuid.Nil, fmt.Errorf("Missing id from query params")
	}
	id, err := uuid.Parse(q)
	if err != nil {
		return uuid.Nil, fmt.Errorf("Missing id from query params")
	}

	return id, nil
}

func respondJSON[T any](w http.ResponseWriter, status int, response Result[T], logger *utils.LoggerImpl) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	r, err := json.MarshalIndent(response, "", "  ")
	if err != nil {
		logger.Error("Error marshaling response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(response)
	logger.Info("response: %s\n", r)
}

func respondSingle[T any](w http.ResponseWriter, status int, item T, logger *utils.LoggerImpl) {
	logger.Info("Responding with single item")

	response := Result[T]{
		Data: item,
	}

	respondJSON(w, status, response, logger)
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
	msg := err.Error()
	response := Result[any]{
		Error: msg,
	}

	respondJSON(w, status, response, logger)
}

type HandlerFn func(w http.ResponseWriter, r *http.Request)

type HandlerImpl struct {
	Path   string
	logger *utils.LoggerImpl
	Routes func() chi.Router
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
