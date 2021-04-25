package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-redis/redis/v8"
)

func respondWithJSON(w http.ResponseWriter, status int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(response)
}

func respondWithError(w http.ResponseWriter, status int, msg string) {
	respondWithJSON(w, status, map[string]string{"message": msg})
}

// this is just a simple way of doing this. we could probably
// use like a hash alg instead
var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")

func generateShortId() string {
	b := make([]rune, 7)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func durationForDuration(d string) (time.Duration, error) {
	switch d {
	case "single":
		return 0, nil
	case "day":
		return time.Hour * 24, nil
	case "hour":
		return time.Hour * 1, nil
	}

	return 0, errors.New("Unknown duration: " + d)
}

type DbEntry struct {
	Url    string `json:"url"`
	Single bool   `json:"single"`
}

func main() {
	r := chi.NewRouter()

	ctx := context.Background()
	db := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})
	defer db.Close()

	r.Post("/", func(w http.ResponseWriter, r *http.Request) {

		var request struct {
			Url      *string `json:"url,omitempty"`
			Duration *string `json:"duration,omitempty"`
		}
		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			respondWithError(w, http.StatusUnprocessableEntity, http.StatusText(http.StatusUnprocessableEntity))
			return
		}

		if request.Url == nil {
			respondWithError(w, http.StatusUnprocessableEntity, "Missing url")
			return
		}
		if request.Duration == nil {
			respondWithError(w, http.StatusUnprocessableEntity, "Missing duration")
			return
		}

		entry := DbEntry{Url: *request.Url, Single: strings.Compare(*request.Duration, "single") == 0}
		log.Println(entry)
		data, err := json.Marshal(entry)
		if err != nil {
			log.Fatal(err)
			return
		}

		duration, err := durationForDuration(*request.Duration)
		if err != nil {
			log.Fatal(err)
			return
		}

		var builder strings.Builder
		scheme := "http"
		if r.TLS != nil {
			scheme = "https"
		}
		builder.WriteString(fmt.Sprintf("%s://%s/", scheme, r.Host))
		for {
			shortId := generateShortId()
			if _, err := db.Get(ctx, shortId).Result(); err != nil {
				err = db.Set(ctx, shortId, data, duration).Err()
				if err != nil {
					log.Fatal(err)
					return
				}
				builder.WriteString(shortId)
				break
			}

		}

		respondWithJSON(w, http.StatusCreated, struct {
			ShortUrl string `json:"short_url"`
		}{ShortUrl: builder.String()})
	})

	r.Get("/{short}", func(w http.ResponseWriter, r *http.Request) {
		if shortId := chi.URLParam(r, "short"); shortId != "" {
			if data, err := db.Get(ctx, shortId).Result(); err == nil {
				var entry DbEntry
				err := json.Unmarshal([]byte(data), &entry)
				if err != nil {
					log.Fatal(err)
					return
				}

				if entry.Single {
					if err = db.Del(ctx, shortId).Err(); err != nil {
						log.Fatal(err)
						return
					}
				}

				http.Redirect(w, r, entry.Url, http.StatusTemporaryRedirect)
				return
			}
		}
		http.NotFound(w, r)
	})

	log.Println("Starting server...")
	log.Fatal(http.ListenAndServe(":8080", r))
}
