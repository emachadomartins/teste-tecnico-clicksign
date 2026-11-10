package utils

import (
	"fmt"
	"strings"
	"time"
)

type Logger interface {
	Info(msg string, args ...any)
	Warn(msg string, args ...any)
	Error(msg string, args ...any)
	Fatal(msg string, args ...any)
}

type LoggerLevel int

const (
	InfoLevel LoggerLevel = iota
	WarnLevel
	ErrorLevel
	FatalLevel
)

func (l LoggerLevel) String() string {
	switch l {
	case InfoLevel:
		return "INFO"
	case WarnLevel:
		return "WARN"
	case ErrorLevel:
		return "ERROR"
	case FatalLevel:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

type LoggerImpl struct {
	prefix []string
}

func (l *LoggerImpl) log(level LoggerLevel, msg string, args ...any) {
	timestamp := time.Now().Format("2006-01-02 15:04")
	m := fmt.Sprintf("[%s][%s]", timestamp, level.String())
	for _, p := range l.prefix {
		m += fmt.Sprintf("[%s]", strings.ToUpper(p))
	}
	m += fmt.Sprintf(" "+msg, args...)
	fmt.Println(m)
}

func (l *LoggerImpl) addPrefix(args ...string) {
	for _, p := range args {
		l.prefix = append(l.prefix, p)
	}
}

func (l *LoggerImpl) Info(msg string, args ...any) {
	l.log(InfoLevel, msg, args...)
}

func (l *LoggerImpl) Warn(msg string, args ...any) {
	l.log(WarnLevel, msg, args...)
}

func (l *LoggerImpl) Error(msg string, args ...any) {
	l.log(ErrorLevel, msg, args...)
}

func (l *LoggerImpl) Fatal(msg string, args ...any) {
	l.log(FatalLevel, msg, args...)
	panic(fmt.Sprintf(msg, args...))
}

func NewLogger(prefix ...string) *LoggerImpl {
	return &LoggerImpl{
		prefix: prefix,
	}
}
