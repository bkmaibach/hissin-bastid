ENGINE_URL=http://localhost:3005

$GOPATH/bin/engine create -c ./snake-config.json \
  | jq --raw-output ".ID" \
  | xargs -I {} sh -c \
      "echo \"Go to this URL in your browser http://localhost:3000/?engine=${ENGINE_URL}&game={}\" && sleep 5; \
        $GOPATH/bin/engine run -g {}"
