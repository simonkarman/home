package users

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/spf13/cobra"
	"karman/karman"
	"net/http"
	"strings"
)

type UserResponse struct {
	Username string   `json:"username"`
	Scopes   []string `json:"scopes"`
}

type UsersResponse struct {
	Total int            `json:"total"`
	Users []UserResponse `json:"users"`
}

func printUser(user *UserResponse) {
	fmt.Printf("%s: %v\n", user.Username, user.Scopes)
}

var pageNumber *int
var pageSize *int
var Cmd = &cobra.Command{
	Use:          "users",
	Short:        "Manage Karman Home users",
	Args:         cobra.ExactArgs(0),
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		var users = &UsersResponse{}
		path := fmt.Sprintf("/api/users?pageNumber=%d&pageSize=%d", *pageNumber, *pageSize)
		err := karman.Request[UsersResponse](users, "GET", karman.ToUrl(karman.GetIdentityHostname(), path), http.NoBody, 200)
		if err != nil {
			return err
		}
		pageStart := *pageNumber**pageSize + 1
		if pageStart > users.Total {
			return errors.New(fmt.Sprintf("users: Page %d does not exist", *pageNumber))
		}
		pageEnd := pageStart + *pageSize - 1
		if pageEnd > users.Total {
			pageEnd = users.Total
		}
		fmt.Printf("Showing users %d to %d (of %d total users)\n", pageStart, pageEnd, users.Total)
		for _, user := range users.Users {
			fmt.Print("- ")
			printUser(&user)
		}
		return nil
	},
}

var createUsername *string
var createPassword *string
var createScopes *[]string
var CreateCmd = &cobra.Command{
	Use:          "create",
	Short:        "Create a Karman Home user",
	Args:         cobra.ExactArgs(0),
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		var user = &UserResponse{}
		body := struct {
			Username string   `json:"username"`
			Password string   `json:"password"`
			Scopes   []string `json:"scopes"`
		}{
			Username: *createUsername,
			Password: *createPassword,
			Scopes:   *createScopes,
		}
		marshalledBody, err := json.Marshal(body)
		if err != nil {
			return err
		}
		err = karman.Request[UserResponse](user, "POST", karman.ToUrl(karman.GetIdentityHostname(), "/api/users"), strings.NewReader(string(marshalledBody)), 201)
		if err != nil {
			return err
		}
		fmt.Print("Created ")
		printUser(user)
		return nil
	},
}

var DeleteCmd = &cobra.Command{
	Use:          "delete username",
	Short:        "Delete a Karman Home user",
	Args:         cobra.ExactArgs(1),
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		var user = args[0]
		var unused *int
		err := karman.Request(unused, "DELETE", karman.ToUrl(karman.GetIdentityHostname(), fmt.Sprintf("/api/users/%s", user)), http.NoBody, 204)
		if err != nil {
			return err
		}
		fmt.Printf("User '%s' deleted\n", user)
		return nil
	},
}

func init() {
	pageNumber = Cmd.Flags().Int("page-number", 0, "The page number")
	pageSize = Cmd.Flags().Int("page-size", 20, "The page size")

	Cmd.AddCommand(CreateCmd)
	createUsername = CreateCmd.Flags().String("username", "", "The username of the user")
	CreateCmd.MarkFlagRequired("username")
	createPassword = CreateCmd.Flags().String("password", "", "The password of the user")
	CreateCmd.MarkFlagRequired("password")
	createScopes = CreateCmd.Flags().StringArray("scope", []string{}, "The scope to assign to the user")

	Cmd.AddCommand(DeleteCmd)
}
