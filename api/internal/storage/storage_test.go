package storage

import (
	"bytes"
	"context"
	"errors"
	"io"
	"io/fs"
	"mime"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

var (
	pngSignature  = []byte("\x89PNG\r\n\x1a\n")
	jpegSignature = []byte("\xFF\xD8\xFF\xE0")
)

func fakeFile(signature []byte, size int) []byte {
	content := make([]byte, size)
	copy(content, signature)
	for i := len(signature); i < size; i++ {
		content[i] = byte(i % 251)
	}
	return content
}

func TestLocalStorageSave(t *testing.T) {
	ctx := context.Background()

	t.Run("png recebe a extensão e é gravado inteiro", func(t *testing.T) {
		dir := t.TempDir()
		s := NewLocalStorage(dir)
		content := fakeFile(pngSignature, 2048)

		name, err := s.Save(ctx, "cover", bytes.NewReader(content))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if name != "cover.png" {
			t.Errorf("got name %q, want cover.png", name)
		}

		saved, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			t.Fatalf("saved file not found: %v", err)
		}
		if !bytes.Equal(saved, content) {
			t.Errorf("saved file differs from the original (%d bytes saved, %d expected)", len(saved), len(content))
		}
	})

	t.Run("jpeg recebe a extensão .jpg", func(t *testing.T) {
		s := NewLocalStorage(t.TempDir())

		name, err := s.Save(ctx, "cover", bytes.NewReader(fakeFile(jpegSignature, 1024)))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if name != "cover.jpg" {
			t.Errorf("got name %q, want cover.jpg", name)
		}
		if got := mime.TypeByExtension(filepath.Ext(name)); got != "image/jpeg" {
			t.Errorf("extension of %q maps to %q, want image/jpeg", name, got)
		}
	})

	t.Run("arquivo menor que 512 bytes é aceito e gravado inteiro", func(t *testing.T) {
		dir := t.TempDir()
		s := NewLocalStorage(dir)
		content := fakeFile(pngSignature, 100)

		name, err := s.Save(ctx, "cover", bytes.NewReader(content))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		saved, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			t.Fatalf("saved file not found: %v", err)
		}
		if !bytes.Equal(saved, content) {
			t.Errorf("saved file differs from the original (%d bytes saved, %d expected)", len(saved), len(content))
		}
	})

	t.Run("arquivo vazio é recusado", func(t *testing.T) {
		s := NewLocalStorage(t.TempDir())

		if _, err := s.Save(ctx, "cover", bytes.NewReader(nil)); err == nil {
			t.Fatal("expected error for an empty file")
		}
	})

	t.Run("tipo não permitido é recusado", func(t *testing.T) {
		dir := t.TempDir()
		s := NewLocalStorage(dir)
		content := []byte(strings.Repeat("apenas texto ", 100))

		if _, err := s.Save(ctx, "cover", bytes.NewReader(content)); err == nil {
			t.Fatal("expected error for a non-image file")
		}

		entries, err := os.ReadDir(dir)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(entries) != 0 {
			t.Errorf("expected no files to be written, found %d", len(entries))
		}
	})
}

func TestLocalStorageRead(t *testing.T) {
	ctx := context.Background()

	t.Run("devolve o conteúdo e o tipo", func(t *testing.T) {
		s := NewLocalStorage(t.TempDir())
		content := fakeFile(pngSignature, 1024)

		name, err := s.Save(ctx, "cover", bytes.NewReader(content))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		reader, contentType, err := s.Read(ctx, name)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		defer reader.Close()

		if contentType != "image/png" {
			t.Errorf("got content type %q, want image/png", contentType)
		}
		read, err := io.ReadAll(reader)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !bytes.Equal(read, content) {
			t.Error("read content differs from the saved content")
		}
	})

	t.Run("arquivo inexistente", func(t *testing.T) {
		s := NewLocalStorage(t.TempDir())

		if _, _, err := s.Read(ctx, "nao-existe.png"); !errors.Is(err, fs.ErrNotExist) {
			t.Errorf("got %v, want fs.ErrNotExist", err)
		}
	})
}

func TestLocalStorageDelete(t *testing.T) {
	ctx := context.Background()

	t.Run("remove o arquivo", func(t *testing.T) {
		dir := t.TempDir()
		s := NewLocalStorage(dir)

		name, err := s.Save(ctx, "cover", bytes.NewReader(fakeFile(pngSignature, 1024)))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if err := s.Delete(ctx, name); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if _, err := os.Stat(filepath.Join(dir, name)); !errors.Is(err, fs.ErrNotExist) {
			t.Errorf("expected the file to be removed, got %v", err)
		}
	})

	t.Run("arquivo inexistente", func(t *testing.T) {
		s := NewLocalStorage(t.TempDir())

		if err := s.Delete(ctx, "nao-existe.png"); !errors.Is(err, fs.ErrNotExist) {
			t.Errorf("got %v, want fs.ErrNotExist", err)
		}
	})
}
