package service

import (
	"context"
	"errors"
	"gerenciador-de-projetos-back/internal/model"
	"gerenciador-de-projetos-back/internal/repository"
	"gerenciador-de-projetos-back/internal/storage"
	"gerenciador-de-projetos-back/internal/utils"
	"io"
	"io/fs"
	"time"

	"github.com/google/uuid"
)

type ProjectService struct {
	repository *repository.ProjectRepository
	logger     *utils.LoggerImpl
	storage    storage.Storage
}

func NewProjectService(l *utils.LoggerImpl, r *repository.ProjectRepository, s storage.Storage) *ProjectService {
	return &ProjectService{
		repository: r,
		logger:     l,
		storage:    s,
	}
}

func (s *ProjectService) List(ctx context.Context, filter model.ProjectFilter) ([]model.ProjectModel, error) {
	return s.repository.FindAll(ctx, model.ProjectQuery{
		Terms:         utils.WordToTerms(filter.Term),
		FavoritesOnly: filter.FavoritesOnly,
		Sort:          filter.Sort,
	})
}

func (s *ProjectService) Create(ctx context.Context, p model.ProjectPayload) (*model.ProjectModel, error) {
	if err := p.RequiredFieldsError(); err != nil {
		return nil, err
	}

	project := &model.ProjectModel{
		BaseModel:   model.NewBaseModel(),
		Name:        *p.Name,
		Client:      *p.Client,
		IsFavorite:  false,
		InitialDate: *p.InitialDate,
		FinalDate:   *p.FinalDate,
	}

	err := project.Validate()

	if err != nil {
		return nil, err
	}

	err = s.repository.Create(ctx, project)

	if err != nil {
		return nil, err
	}

	return project, nil
}

func (s *ProjectService) Read(ctx context.Context, id uuid.UUID) (*model.ProjectModel, error) {

	return s.repository.FindByID(ctx, id)
}

func (s *ProjectService) Update(ctx context.Context, id uuid.UUID, p model.ProjectPayload) (*model.ProjectModel, error) {
	project, err := s.repository.FindByID(ctx, id)

	if err != nil {
		return nil, err
	}

	if p.Name != nil {
		project.Name = *p.Name
	}
	if p.Client != nil {
		project.Client = *p.Client
	}

	if p.InitialDate != nil {
		project.InitialDate = *p.InitialDate
	}
	if p.FinalDate != nil {
		project.FinalDate = *p.FinalDate
	}

	err = project.Validate()

	if err != nil {
		return nil, err
	}
	project.UpdatedAt = time.Now()

	err = s.repository.Update(ctx, project)

	if err != nil {
		return nil, err
	}

	return project, nil

}

func (s *ProjectService) Delete(ctx context.Context, id uuid.UUID) error {
	project, err := s.repository.FindByID(ctx, id)

	if err != nil {
		return err
	}

	if err := s.repository.Delete(ctx, id); err != nil {
		return err
	}

	if project.CoverURL != nil {
		if err := s.storage.Delete(ctx, *project.CoverURL); err != nil {
			s.logger.Error("failed to delete cover %s: %s", *project.CoverURL, err)
		}
	}

	return nil
}

func (s *ProjectService) SetFavorite(ctx context.Context, id uuid.UUID, isFavorite bool) (*model.ProjectModel, error) {
	if err := s.repository.SetFavorite(ctx, id, isFavorite); err != nil {
		return nil, err
	}
	return s.repository.FindByID(ctx, id)
}

func (s *ProjectService) UploadCoverImage(ctx context.Context, id uuid.UUID, content io.Reader) (*model.ProjectModel, error) {
	project, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	coverImagePath, err := s.storage.Save(ctx, project.ID.String(), content)
	if err != nil {
		return nil, err
	}

	project.CoverURL = &coverImagePath
	project.UpdatedAt = time.Now()

	err = s.repository.Update(ctx, project)
	if err != nil {
		return nil, err
	}

	return project, nil
}

func (s *ProjectService) GetCoverImage(ctx context.Context, id uuid.UUID) (io.ReadCloser, string, error) {
	project, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, "", err
	}

	if project.CoverURL == nil {
		return nil, "", model.ErrNoCover
	}

	return s.storage.Read(ctx, *project.CoverURL)
}

func (s *ProjectService) DeleteCoverImage(ctx context.Context, id uuid.UUID) error {
	project, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return err
	}

	if project.CoverURL == nil {
		return model.ErrNoCover
	}

	err = s.storage.Delete(ctx, *project.CoverURL)
	if err != nil && !errors.Is(err, fs.ErrNotExist) {
		return err
	}

	project.CoverURL = nil
	project.UpdatedAt = time.Now()

	err = s.repository.Update(ctx, project)
	if err != nil {
		return err
	}

	return nil
}
