# -*- sh -*-
# shellcheck shell=bash
    # shellcheck disable=SC2059 #https://github.com/koalaman/shellcheck/wiki/SC2059

FLY_DATE="2026-08-06"
CRUISE_DATE="2026-08-09"
END_CRUISE_DATE="2026-08-16"
FLY_HOME_DATE="2026-08-18"
TODAY=${1:-$(date -u +%Y-%m-%d)}
echo "TODAY is $TODAY"

FLY_EPOCH=$(date -d "$FLY_DATE" +%s)
CRUISE_EPOCH=$(date -d "$CRUISE_DATE" +%s)
END_CRUISE_EPOCH=$(date -d "$END_CRUISE_DATE" +%s)
FLY_HOME_EPOCH=$(date -d "$FLY_HOME_DATE" +%s)
TODAY_EPOCH=$(date -d "$TODAY" +%s)

FLY_DIFF=$(( (FLY_EPOCH - TODAY_EPOCH) / 86400 ))
CRUISE_DIFF=$(( (CRUISE_EPOCH - TODAY_EPOCH) / 86400 ))
END_CRUISE_DIFF=$(( (END_CRUISE_EPOCH - TODAY_EPOCH) / 86400 ))
FLY_HOME_DIFF=$(( (FLY_HOME_EPOCH - TODAY_EPOCH) / 86400 ))
DAY_OF_CRUISE=$(( (TODAY_EPOCH - CRUISE_EPOCH) /86400 ))
DAY_OF_CRUISE=$(( DAY_OF_CRUISE + 1 ))

# shellcheck disable=SC2089 #https://github.com/koalaman/shellcheck/wiki/SC2089
ITALIAN_FLAG='<img src="assets/images/Flag_of_Italy.svg" alt="Italian flag" width="20">'

TWO_LINE_FORMAT='# %s\n \n# %s'
ONE_LINE_FORMAT='# %s'
if [ "$FLY_DIFF" -gt 1 ]; then
    printf -v MESSAGE "$TWO_LINE_FORMAT" \
           "✈️ $FLY_DIFF days until we leave for Barcelona on August 6th" \
           "🚢 $CRUISE_DIFF days until the cruise on August 9th!"
elif [ "$FLY_DIFF" -eq 1 ]; then
    printf -v MESSAGE "$TWO_LINE_FORMAT" \
           "✈️ $FLY_DIFF day to go - we fly tomorrow!" \
           "🚢 $CRUISE_DIFF days until the cruise on August 9th."
elif [ "$FLY_DIFF" -eq 0 ]; then
    printf -v MESSAGE "$TWO_LINE_FORMAT" \
           "✈️ Barcelona, here we come!" \
           "🚢 $CRUISE_DIFF days until the cruise on August 9th."
elif [ "$CRUISE_DIFF" -gt 1 ]; then
    printf -v MESSAGE "$ONE_LINE_FORMAT" \
           "🚢 $CRUISE_DIFF days until the cruise on August 9, 2026!"
elif [ "$CRUISE_DIFF" -eq 1 ]; then
    printf -v MESSAGE "$ONE_LINE_FORMAT" \
           "🚢 1 day to go — the cruise is TOMORROW!"
elif [ "$CRUISE_DIFF" -eq 0 ]; then
    printf -v MESSAGE "$ONE_LINE_FORMAT" \
           "🎉 TODAY IS THE DAY! Bon voyage! ⚓"
elif [ "$END_CRUISE_DIFF" -gt 0 ]; then
    printf -v MESSAGE "$ONE_LINE_FORMAT" \
           "🚢 Today is Cruise Day $DAY_OF_CRUISE. Enjoy!"
elif [ "$END_CRUISE_DIFF" -eq 0 ]; then
    printf -v MESSAGE "$ONE_LINE_FORMAT" \
           '😞 Today is Disembarkation day. Enjoy your time in '"${ITALIAN_FLAG}"'!'
elif [ "$FLY_HOME_DIFF" -gt 0 ]; then
    printf -v MESSAGE "$ONE_LINE_FORMAT" \
           'Enjoy your time in '"${ITALIAN_FLAG}"'!'
elif [ "$FLY_HOME_DIFF" -eq 0 ]; then
    printf -v MESSAGE "$ONE_LINE_FORMAT" \
           "✈️ Time to go home!"
else
    printf -v MESSAGE "$ONE_LINE_FORMAT" \
           "🌊 The cruise ended $((END_CRUISE_DIFF * -1)) days ago. Hope it was amazing for you!"
fi

echo "$MESSAGE"

##
## Replace the line between the countdown markers in README.md
##

# Determine the top dir in the repo.
REPO_ROOT=${GITHUB_WORKSPACE:-$(git -C "$(dirname -- "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)}

# Define what file we are modifying
README="$REPO_ROOT/README.md"

if [[ ${GITHUB_ACTIONS:-false} == true ]]; then
    # If on the github site, modify the actual file.
    OUTPUT=$README
else
    # Create a copy for testing.
    OUTPUT="$REPO_ROOT/README.test.md"
    cp -- "$README" "$OUTPUT"
fi

printf 'Editing: %s\n' "$OUTPUT"

# Check syntax on replacement marker.
if ! grep -q '<!--[[:space:]]*COUNTDOWN_START[[:space:]]*-->' "$OUTPUT"; then
    printf 'ERROR: COUNTDOWN_START marker not found in %s\n' "$OUTPUT" >&2
    exit 1
fi

if ! grep -q '<!--[[:space:]]*COUNTDOWN_END[[:space:]]*-->' "$OUTPUT"; then
    printf 'ERROR: COUNTDOWN_END marker not found in %s\n' "$OUTPUT" >&2
    exit 1
fi

# 'export'ing is the easiest way to get any embedded newlines through all the
# shell processing.
export MESSAGE

# Do the replacement.
perl -0pi -e '
    $replacement =
        "<!-- COUNTDOWN_START -->\n"
        . $ENV{MESSAGE}
        . "\n<!-- COUNTDOWN_END -->";

    $count = s{
        <!--[[:space:]]*COUNTDOWN_START[[:space:]]*-->
        .*?
        <!--[[:space:]]*COUNTDOWN_END[[:space:]]*-->
    }{$replacement}gsx;

    die "No substitution made\n" unless $count;
' "$OUTPUT"
