package pkg

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path"
)

type Context struct {
	SessionToken string `json:"session-token"`
}

func (context *Context) Write() error {
	contextFilePath, err := GetContextFilePath()
	if err != nil {
		return err
	}
	if stat, err := os.Stat(path.Dir(contextFilePath)); os.IsNotExist(err) || !stat.IsDir() {
		err := os.MkdirAll(path.Dir(contextFilePath), 0755)
		if err != nil {
			return err
		}
	}
	contextAsJson, err := json.MarshalIndent(context, "", "  ")
	if err != nil {
		return err
	}
	err = os.WriteFile(contextFilePath, contextAsJson, 0644)
	if err != nil {
		return err
	}
	return nil
}

func GetContextFilePath() (string, error) {
	contextFilePath := os.Getenv("KARMAN_HOME_CONTEXT")
	if len(contextFilePath) == 0 {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		contextFilePath = fmt.Sprintf("%s/.karman/context", homeDir)
	}
	return contextFilePath, nil
}

func GetContext() (*Context, error) {
	// Context
	contextFilePath, err := GetContextFilePath()
	if err != nil {
		return nil, err
	}

	// Return empty context if context file does not exist
	if _, err := os.Stat(contextFilePath); errors.Is(err, os.ErrNotExist) {
		return &Context{}, nil
	}

	// Parse context file content
	contextFile, err := os.Open(contextFilePath)
	if err != nil {
		fmt.Println(err.Error())
	}
	defer contextFile.Close()
	jsonDecoder := json.NewDecoder(contextFile)
	jsonDecoder.DisallowUnknownFields()
	var context Context
	err = jsonDecoder.Decode(&context)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("context %s: %s", contextFilePath, err))
	}
	return &context, nil
}
