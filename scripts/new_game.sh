ENGINE_URL=http://localhost:3005

/home/tgriffith/go/bin/engine create -c ./snake-config.json \
  | jq --raw-output ".ID" \
  | xargs -I {} sh -c \
      "xdg-open \"http://localhost:3000?engine=http%3A%2F%2Flocalhost%3A3005&game={}\" && sleep 5; \
        /home/tgriffith/go/bin/engine run -g {}"
