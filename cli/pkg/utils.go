package pkg

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
)

type Context struct {
	SessionToken string `json:"session-token"`
}

func GetContext() (*Context, error) {
	// Context Path
	contextPath := os.Getenv("KARMAN_HOME_CONTEXT")
	if len(contextPath) == 0 {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return nil, err
		}
		contextPath = fmt.Sprintf("%s/.karmanhome", homeDir)
	}

	// Return empty context if context file does not exist
	if _, err := os.Stat(contextPath); errors.Is(err, os.ErrNotExist) {
		return &Context{}, nil
	}

	// Parse context file content
	contextFile, err := os.Open(contextPath)
	if err != nil {
		fmt.Println(err.Error())
	}
	defer contextFile.Close()
	jsonDecoder := json.NewDecoder(contextFile)
	jsonDecoder.DisallowUnknownFields()
	var context Context
	err = jsonDecoder.Decode(&context)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("context %s: %s", contextPath, err))
	}
	return &context, nil
}

func GetDomain() string {
	baseUrl := os.Getenv("KARMAN_HOME_DOMAIN")
	if len(baseUrl) == 0 {
		baseUrl = "karman.dev"
	}
	return baseUrl
}

func ToUrl(hostname string, path string) string {
	protocol := os.Getenv("KARMAN_HOME_PROTOCOL")
	if len(protocol) == 0 {
		protocol = "https"
	}
	if len(path) > 0 && string(path[0]) != "/" {
		path = fmt.Sprintf("/%s", path)
	}
	return fmt.Sprintf("%s://%s%s", protocol, hostname, path)
}

func GetLandingHostname() string {
	landingHostname := os.Getenv("KARMAN_HOME_LANDING_HOSTNAME")
	if len(landingHostname) == 0 {
		return fmt.Sprintf("home.%s", GetDomain())
	}
	return landingHostname
}

func GetIdentityHostname() string {
	identityHostname := os.Getenv("KARMAN_HOME_IDENTITY_HOSTNAME")
	if len(identityHostname) == 0 {
		return fmt.Sprintf("identity.%s", GetDomain())
	}
	return identityHostname
}

func GetChatHostname() string {
	chatHostname := os.Getenv("KARMAN_HOME_CHAT_HOSTNAME")
	if len(chatHostname) == 0 {
		return fmt.Sprintf("chat.%s", GetDomain())
	}
	return chatHostname
}
