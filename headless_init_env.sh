#!/bin/bash
set -e
IFS='|'

AWSCLOUDFORMATIONCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":true,\
\"profileName\":\"default\"\
}"
AMPLIFY="{\
<<<<<<< HEAD
\"envName\":\"prod\"\
=======
\"envName\":\"test\"\
>>>>>>> test
}"
PROVIDERS="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG\
}"

amplify init \
--amplify $AMPLIFY \
--providers $PROVIDERS \
--yes