package pkg

import (
	"fmt"
	"os"
)

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
