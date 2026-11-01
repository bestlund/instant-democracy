# Design decisions

Every design choice in the prototype, with the reason behind it. Where a
decision comes from user testing, the testers are named. The IDs (D1, D2…)
are referenced in code comments and commit messages, so you can trace any
part of the UI back to why it looks the way it does.

**Sources**
- Usability test of the lo-fi prototype, 8 testers (Carlos, Jorcag, Lucia, Duarte, Gil, Yuan, David, Marko), think-aloud. Scenario: you are in the *Roommates* group, a roommate has started a poll about who calls the landlord about the broken fridge, and you vote.
- Contextual interviews (shared flat in Coimbra, voting abroad), see the project notebook.
- Persona: Lea, introverted student in a shared flat who is afraid of being judged.

---

## Overall

### D1. Monochrome first, accents later
Black, white and greys only (`tailwind.config.js`). One black primary button per screen; everything else white or light grey.
**Why:** The team decided to fix structure and hierarchy before colour. Without accents, testers react to layout and wording, which is what the last test was about. Colour is added in a later iteration. All text meets 4.5:1 contrast.

### D2. Mobile only, shown in an iPhone frame on a laptop
On a phone the app fills the screen. On a laptop it sits in an iPhone frame at real size (390 × 844), with a "Reset demo" button next to it.
**Why:** The product is used on the phone. The frame lets teachers and testers on a laptop see it at real size. Reset (also `/#/reset`) gives every tester the same starting point.

### D3. Groups and discussions must never look alike
- Groups are named after communities (*Roommates, Run club*), discussions and polls after topics (*Broken fridge, Movie night*).
- The group screen opens with the **members** (avatars), so it reads as "people", while Home reads as "places".
- The word "subgroup" is gone. The levels are *Group → Discussion / Poll*.

**Why:** 3 of 8 testers mixed up groups and discussions. Gil talked about group names as discussion topics, Duarte said the first two screens were too similar, and Marko didn't understand the difference between groups and discussions.

### D16. Links work on any host
The app uses hash links (`/#/g/roommates`).
**Why:** Vercel and other static hosts serve them without rewrite rules, and refreshing a page never gives a 404 during a test.

---

## Home

### D4. List of groups, with a bell for notifications
Home is the list version. A bell at the top right opens a page with all notifications across groups.
**Why:** The first home screen was preferred (team tally 5–4): "more obvious", "easier for a new user" (David), "shows more info" (Marko). From the second version we kept the idea testers liked: Duarte said it showed "what is the most important thing I have to do". David suggested a bell at the top right.

### D5. One line per group that says what needs you
Under each group name: *"Vote on Broken fridge · closes in 3h"*, *"2 new comments in Dinner Friday"* or *"All caught up"*, plus a number badge.
**Why:** You can tell whether to open a group without tapping into it. This brings the "what to do" of the second version into the list without a separate section.

### D6. One "+ New" button that asks what to make
"+ New" opens a sheet: Discussion, Poll, Group, Join with a link or code. Inside a group, "+ New" offers Discussion or Poll for that group.
**Why:** 4 of 8 testers (Lucia, Duarte, Gil, David) pressed "+ New" first, whatever they wanted to do. Lucia failed the movie-night task this way. Instead of fighting that habit, "+ New" now asks what you want to make. "Join" moved into the same sheet because Marko pressed "Join" to open a group.

### D9. What needs you comes first
Groups and threads are sorted: needs your vote → closes soonest → newest.
**Why:** The most important thing to do is always at the top, on Home and inside a group.

---

## Group

### D8. Countdown only when less than 24 hours are left
"Closes in 3h" under 24 hours, otherwise the weekday ("Closes Wed"). Urgent polls you haven't voted on get a black chip.
**Why:** A countdown creates urgency. If everything counts down, nothing feels urgent.

### D10. Every decision says who takes care of it
The Decided tab shows the outcome, the date, **who takes care of it**, and whether it's done.
**Why:** In the shared-flat interview, complaints about the fridge went around for two weeks until one person contacted the landlord. A decision without someone responsible doesn't fix that.

---

## Discussions and polls

### D7. One screen for discussions and polls
A discussion can get a poll inside it, and a poll always has comments under it. Only the starting point differs.
**Why:** Team decision. Real conversations move between talking and voting. Sharing one screen also means testers only have to learn one layout.

### D11. You can see who has voted, but not what they voted (unless they chose to show it)
Every poll shows "2 of 4 voted", avatars of who has voted, and "Waiting for you and Tom". After voting, results list the names of people who voted with their name and count the rest as "anonymous". The group's member list is one tap away.
**Why:** Carlos asked "how do we know if everyone is going to vote?" and Yuan asked "can I see the names of the people?". Showing *who* took part answers both, and hiding *what* anonymous voters chose keeps anonymity.

### D12. Results show after you vote
Before you vote you only see the options and who has voted. After voting you see the full result and can still change your vote until the poll closes.
**Why:** If you can see that one option is already winning, you are likely to follow the group (bandwagon effect) instead of choosing for yourself. The app is about everyone's own voice, especially people like Lea who already hold back.

### D13. Votes are anonymous by default; comments use your name by default
"Vote as" starts on *Anonymous*. The comment bar starts on *your name*, with "Change" to post anonymously.
**Why:** Voting anonymously lowers the barrier for people like Lea, who are afraid of being seen as difficult (persona, HAM model: "choose whether to participate anonymously or openly"). Discussions work better when people know who says what, so comments use your name, but switching is one tap.

### D14. A chat-style comment bar instead of "+ Suggest option"
The bottom of a discussion is a normal comment bar like in any chat app. The "+" next to it adds a poll.
**Why:** People don't think in "options", they talk. A separate "suggest option" button would rarely be used and goes against the finding that too many options make decisions hard.

### D15. Unfinished actions say so instead of doing nothing
Tapping something that isn't built yet (creating a discussion, poll or group, group settings) shows "coming in the next step".
**Why:** A dead tap makes testers think the app is broken, which pollutes the test results.

---

## Open questions
- **Who can see who an anonymous person is?** Nobody, or only the group owner? (Safest for Lea is nobody, but then moderation is needed.)
- **Does a vote count if only 2 of 5 vote?** A minimum number of votes (quorum) would fit the theme.
- **Persona:** the notebook also has a persona "Francesca" (politics). The prototype is built for Lea (shared flat). Check with Elisabetta.
