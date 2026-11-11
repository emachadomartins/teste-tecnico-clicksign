package repository

import (
	"context"
	"gerenciador-de-projetos-back/internal/model"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) *ProjectRepository {
	return &ProjectRepository{
		db: db,
	}
}

func (r *ProjectRepository) Create(ctx context.Context, p *model.ProjectModel) error {
	return r.db.WithContext(ctx).Create(p).Error
}

func (r *ProjectRepository) FindAll(ctx context.Context) ([]model.ProjectModel, error) {
	var projects []model.ProjectModel
	err := r.db.WithContext(ctx).Find(&projects).Error
	return projects, err
}

func (r *ProjectRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.ProjectModel, error) {
	var project model.ProjectModel
	err := r.db.WithContext(ctx).First(&project, "id = ?", id).Error
	return &project, err
}

func (r *ProjectRepository) Update(ctx context.Context, p *model.ProjectModel) error {
	return r.db.WithContext(ctx).Save(p).Error
}
func (r *ProjectRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.ProjectModel{}, "id = ?", id).Error
}
