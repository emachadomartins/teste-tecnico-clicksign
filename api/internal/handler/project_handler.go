package handler

import (
	"errors"
	"gerenciador-de-projetos-back/internal/model"
	"gerenciador-de-projetos-back/internal/repository"
	"gerenciador-de-projetos-back/internal/service"
	"gerenciador-de-projetos-back/internal/storage"
	"io"
	"net/http"

	"github.com/go-chi/chi"
)

type ProjectHandler struct {
	HandlerImpl
	service service.ProjectService
}

func (h *ProjectHandler) GetMany(w http.ResponseWriter, r *http.Request) {
	projects, err := h.service.List(r.Context())

	if err != nil {
		respondError(w, http.StatusInternalServerError, err, h.logger)
		return
	}

	respondList(w, projects, h.logger)
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {

	payload, err := decodeBodyJson[model.ProjectPayload](r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}
	project, err := h.service.Create(r.Context(), payload)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err, h.logger)
		return
	}

	respondSingle(w, http.StatusCreated, project, h.logger)
}

func (h *ProjectHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	project, err := h.service.Read(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	respondSingle(w, http.StatusOK, project, h.logger)
}

func (h *ProjectHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}
	payload, err := decodeBodyJson[model.ProjectPayload](r)

	project, err := h.service.Update(r.Context(), id, payload)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	respondSingle(w, http.StatusOK, project, h.logger)
}

func (h *ProjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	err = h.service.Delete(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ProjectHandler) SetFavorite(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	payload, err := decodeBodyJson[model.FavoritePayload](r)
	if err != nil || payload.IsFavorite == nil {
		respondError(w, http.StatusBadRequest, errors.New("is_favorite is required"), h.logger)
		return
	}

	project, err := h.service.SetFavorite(r.Context(), id, *payload.IsFavorite)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	respondSingle(w, http.StatusOK, project, h.logger)
}

func (h *ProjectHandler) UploadCover(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 5<<20)

	file, _, err := r.FormFile("cover")

	if err != nil {
		respondError(w, http.StatusBadRequest, errors.New("cover file is required"), h.logger)
		return
	}
	defer file.Close()

	project, err := h.service.UploadCoverImage(r.Context(), id, file)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)

		return
	}

	respondSingle(w, http.StatusOK, project, h.logger)
}

func (h *ProjectHandler) GetCover(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	reader, contentType, err := h.service.GetCoverImage(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	defer reader.Close()

	w.Header().Set("Content-Type", contentType)
	w.WriteHeader(http.StatusOK)
	if _, err := io.Copy(w, reader); err != nil {
		h.logger.Error("error writing cover image: %s", err)
	}

}

func (h *ProjectHandler) DeleteCover(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	err = h.service.DeleteCoverImage(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ProjectHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/", h.GetMany)
	r.Post("/", h.Create)
	r.Get("/{id}", h.GetByID)
	r.Put("/{id}", h.Update)
	r.Patch("/{id}/favorite", h.SetFavorite)
	r.Delete("/{id}", h.Delete)
	r.Post("/{id}/cover", h.UploadCover)
	r.Get("/{id}/cover", h.GetCover)
	return r
}

func NewProjectHandler(
	repository *repository.ProjectRepository, storage *storage.LocalStorage) *ProjectHandler {
	h := NewHandler("project")

	s := service.NewProjectService(h.logger, repository, storage)

	return &ProjectHandler{
		HandlerImpl: *h,
		service:     *s,
	}
}
