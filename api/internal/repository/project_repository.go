package repository

import (
	"context"
	"fmt"
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

func (r *ProjectRepository) FindAll(ctx context.Context, filter model.ProjectQuery) ([]model.ProjectModel, error) {
	var projects []model.ProjectModel
	query := r.db.WithContext(ctx).Model(projects)

	if filter.Terms != nil && len(filter.Terms) > 0 {
		for _, term := range filter.Terms {
			like := "%" + term + "%"
			query = query.Where("(unaccent(lower(name)) LIKE ? OR unaccent(lower(client)) LIKE ?)", like, like)
		}
	}

	if filter.FavoritesOnly {
		query = query.Where("is_favorite = ?", true)
	}

	switch filter.Sort {
	case model.SortByInitialDate:
		query = query.Order("initial_date DESC")
	case model.SortByFinalDate:
		query = query.Order("final_date ASC")
	default:
		query = query.Order("name ASC")
	}

	err := query.Find(&projects).Error

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

func (r *ProjectRepository) SetFavorite(ctx context.Context, id uuid.UUID, isFavorite bool) error {
	res := r.db.WithContext(ctx).
		Model(&model.ProjectModel{}).
		Where("id = ?", id).
		Update("is_favorite", isFavorite)

	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return fmt.Errorf("Project not found: %s", id)
	}
	return nil
}
