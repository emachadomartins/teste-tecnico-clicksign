package storage

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"gerenciador-de-projetos-back/internal/utils"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
)

var ErrInvalidContentType = errors.New("invalid content type")

type Storage interface {
	Save(ctx context.Context, name string, content io.Reader) (string, error)
	Read(ctx context.Context, path string) (io.ReadCloser, string, error)
	Delete(ctx context.Context, path string) error
}

var _ Storage = (*LocalStorage)(nil)

type LocalStorage struct {
	basePath            string
	allowedContentTypes []string
}

func NewLocalStorage(basePath string) *LocalStorage {
	err := os.MkdirAll(basePath, 0755)
	if err != nil {
		panic(err)
	}

	return &LocalStorage{
		basePath: basePath,
		allowedContentTypes: []string{
			"image/jpeg",
			"image/png",
		},
	}
}

func (s *LocalStorage) Save(ctx context.Context, name string, content io.Reader) (string, error) {
	head := make([]byte, 512)
	n, err := io.ReadFull(content, head)
	if err != nil && !errors.Is(err, io.ErrUnexpectedEOF) && !errors.Is(err, io.EOF) {
		return "", err
	}
	head = head[:n]

	contentType := http.DetectContentType(head)

	allowed := false
	for _, t := range s.allowedContentTypes {
		if t == contentType {
			allowed = true
			break
		}
	}

	if !allowed {
		return "", fmt.Errorf("%w: %s", ErrInvalidContentType, contentType)
	}

	fileName := name + utils.DetectFileExtension(contentType)

	f, err := os.Create(filepath.Join(s.basePath, fileName))

	if err != nil {
		return "", err
	}
	defer f.Close()

	_, err = io.Copy(f, io.MultiReader(bytes.NewReader(head), content))

	if err != nil {
		return "", err
	}

	return fileName, nil
}

func (s *LocalStorage) Read(ctx context.Context, path string) (io.ReadCloser, string, error) {
	f, err := os.Open(filepath.Join(s.basePath, path))
	if err != nil {
		return nil, "", err
	}

	contentType := mime.TypeByExtension(filepath.Ext(path))

	return f, contentType, nil
}

func (s *LocalStorage) Delete(ctx context.Context, path string) error {
	err := os.Remove(filepath.Join(s.basePath, path))
	return err
}
