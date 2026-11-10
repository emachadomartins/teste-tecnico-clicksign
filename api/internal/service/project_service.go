package service

import (
	"fmt"
	"gerenciador-de-projetos-back/internal/model"
	"gerenciador-de-projetos-back/internal/utils"
	"time"

	"github.com/google/uuid"
)

type ProjectService struct {
	projects []model.ProjectModel
	logger   *utils.LoggerImpl
}

func NewProjectService(l *utils.LoggerImpl) *ProjectService {
	return &ProjectService{
		projects: []model.ProjectModel{},
		logger:   l,
	}
}

func (s *ProjectService) List() []model.ProjectModel {
	return s.projects
}

func (s *ProjectService) Create(p model.ProjectPayload) (*model.ProjectModel, error) {
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

	s.projects = append(s.projects, *project)
	return project, nil
}

func (s *ProjectService) Read(id uuid.UUID) (*model.ProjectModel, error) {
	for _, project := range s.projects {
		if project.ID == id {
			return &project, nil
		}
	}
	return nil, fmt.Errorf("Project not found: %s", id)
}

func (s *ProjectService) Update(id uuid.UUID, p model.ProjectPayload) (*model.ProjectModel, error) {
	for i, project := range s.projects {
		if project.ID == id {
			newProject := project

			if p.Name != nil {
				newProject.Name = *p.Name
			}
			if p.Client != nil {
				newProject.Client = *p.Client
			}
			if p.IsFavorite != nil {
				newProject.IsFavorite = *p.IsFavorite
			}

			if p.InitialDate != nil {
				newProject.InitialDate = *p.InitialDate
			}
			if p.FinalDate != nil {
				newProject.FinalDate = *p.FinalDate
			}

			err := newProject.Validate()

			if err != nil {
				return nil, err
			}
			newProject.UpdatedAt = time.Now()
			s.projects[i] = newProject

			return &s.projects[i], nil
		}

	}
	return nil, fmt.Errorf("Project not found: %s", id)
}

func (s *ProjectService) Delete(id uuid.UUID) error {
	for i, project := range s.projects {
		if project.ID == id {
			s.projects = append(s.projects[:i], s.projects[i+1:]...)
			return nil
		}
	}
	return fmt.Errorf("Project not found: %s", id)
}
