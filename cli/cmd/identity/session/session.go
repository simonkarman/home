package session

import (
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"io"
	"karman/pkg"
	"net/http"
)

var Cmd = &cobra.Command{
	Use:          "session",
	Short:        "Manage your Karman Home identity session",
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		context, err := pkg.GetContext()
		if err != nil {
			return err
		}
		req, err := http.NewRequest("GET", pkg.ToUrl(pkg.GetIdentityHostname(), "/api/sessions"), http.NoBody)
		if err != nil {
			return err
		}
		req.AddCookie(&http.Cookie{Name: "session-token", Value: context.SessionToken})
		if err != nil {
			return err
		}
		resp, err := (&http.Client{}).Do(req)
		if err != nil {
			return err
		}
		if resp.StatusCode == 200 {
			fmt.Println(color.GreenString("Session valid"))
		} else {
			fmt.Println(color.RedString("Session invalid"))
		}
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		body := string(bodyBytes)
		fmt.Println(body)
		return nil
	},
}

var LoginCmd = &cobra.Command{
	Use:          "login",
	Short:        "Login to your Karman Home identity",
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		username, _ := cmd.Flags().GetString("username")
		password, _ := cmd.Flags().GetString("password")
		req, err := http.NewRequest("POST", pkg.ToUrl(pkg.GetIdentityHostname(), "/api/sessions"), http.NoBody)
		if err != nil {
			return err
		}
		auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", username, password)))
		req.Header.Add("Authorization", fmt.Sprintf("Basic %s", auth))
		resp, err := (&http.Client{}).Do(req)
		if err != nil {
			return err
		}
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		body := string(bodyBytes)
		if resp.StatusCode != 201 {
			fmt.Println(color.RedString("Login failed"))
			return errors.New(body)
		}
		context, err := pkg.GetContext()
		if err != nil {
			return err
		}
		context.SessionToken = resp.Cookies()[1].Value
		err = context.Write()
		if err != nil {
			return err
		}
		fmt.Println(color.GreenString("Login successful"))
		fmt.Println(body)
		return nil
	},
}

var LogoutCmd = &cobra.Command{
	Use:          "logout",
	Short:        "Logout from your Karman Home identity",
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		context, err := pkg.GetContext()
		if err != nil {
			return err
		}
		context.SessionToken = ""
		err = context.Write()
		if err != nil {
			return err
		}
		return nil
	},
}

func init() {
	// Login
	Cmd.AddCommand(LoginCmd)
	LoginCmd.Flags().StringP("username", "u", "", "Your Karman Home username")
	LoginCmd.MarkFlagRequired("username")
	LoginCmd.Flags().StringP("password", "p", "", "Your Karman Home password")
	LoginCmd.MarkFlagRequired("password")

	// Logout
	Cmd.AddCommand(LogoutCmd)
}
