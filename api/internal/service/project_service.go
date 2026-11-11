package service

import (
	"context"
	"fmt"
	"gerenciador-de-projetos-back/internal/model"
	"gerenciador-de-projetos-back/internal/repository"
	"gerenciador-de-projetos-back/internal/utils"
	"time"

	"github.com/google/uuid"
)

type ProjectService struct {
	repository *repository.ProjectRepository
	logger     *utils.LoggerImpl
}

func NewProjectService(l *utils.LoggerImpl, r *repository.ProjectRepository) *ProjectService {
	return &ProjectService{
		repository: r,
		logger:     l,
	}
}

func (s *ProjectService) List(ctx context.Context) ([]model.ProjectModel, error) {
	return s.repository.FindAll(ctx)
}

func (s *ProjectService) Create(ctx context.Context, p model.ProjectPayload) (*model.ProjectModel, error) {
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

	if project == nil {
		return nil, fmt.Errorf("Project not found: %s", id)
	}

	if p.Name != nil {
		project.Name = *p.Name
	}
	if p.Client != nil {
		project.Client = *p.Client
	}
	if p.IsFavorite != nil {
		project.IsFavorite = *p.IsFavorite
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
	return s.repository.Delete(ctx, id)
}
