# Meetup email templates (Resend)

Three hosted templates, one per meetup email. The proposal carries the note and
takes 12 variables. Accepted and declined hardcode their copy, have no note, and
take 6.

| Email | Sent to | Resend alias (`ut`) | Variables |
| --- | --- | --- | --- |
| Proposed | the recipient | `ut-propose-a-meetup-09` | 12 |
| Accepted | both students | `ut-meetup-accepted-10` | 6 |
| Declined | the proposer | `ut-meetup-declined-11` | 6 |

The HTML lives only in Resend. The repo keeps no copy.

The aliases must match `emailTemplates` for `ut` in
`src/features/school/registry/registry.ts` (`meetupProposed`, `meetupAccepted`,
`meetupDeclined`). Schools without an override fall back to `meetup-proposed`,
`meetup-accepted` and `meetup-declined` from `src/lib/email/catalog.ts`.

## Variables

All type **string**. The code sends exactly the variables listed for each
template, so declare exactly those and no others.

**Proposed** (12):

| Variable | Example |
| --- | --- |
| `eyebrow` | `Meetup` |
| `kicker` | `New proposal` |
| `headline` | `Hannah wants to meet you on campus` |
| `firstName` | `Ethan` (the student the email is addressed to) |
| `message` | `Hannah proposed a meetup. Accept or decline from your chat.` |
| `locationName` | `Texas Union, Main Lounge` |
| `locationBuilding` | `Texas Union` (empty when the spot has no building) |
| `meetupTime` | `Tue Oct 20 · 4:00 PM Central` |
| `noteLabel` | `Note` (empty when there is no note) |
| `note` | `“Coffee and compare notes on the pitch?”` (empty likewise) |
| `ctaLabel` | `Respond` |
| `ctaUrl` | `https://ut.mamuncofoundr.com/matches/<conversation id>` |

**Accepted and declined** (6 each):

| Variable | Example |
| --- | --- |
| `firstName` | `Ethan` (the student the email is addressed to) |
| `matchName` | `Hannah` (accepted: the other student. Declined: the student who declined) |
| `locationName` | `Texas Union, Main Lounge` |
| `locationBuilding` | `Texas Union` (empty when the spot has no building) |
| `meetupTime` | `Tue Oct 20 · 4:00 PM Central` |
| `ctaUrl` | `https://ut.mamuncofoundr.com/matches/<conversation id>` |

`RESEND_UNSUBSCRIBE_URL` in the footer is filled in by Resend, not by us.

For any variable that can be empty (`locationBuilding`, `noteLabel`, `note`),
set a **fallback of a single space**. It only matters if Resend treats an empty
string as "missing", which would otherwise show the fallback text.

## Create them in Resend

1. Templates, Create template, and set the alias from the table.
2. Declare the variables above.
3. **Publish** each one. Only published templates can be used when sending.
4. The sending domain `mamuncofoundr.com` must be verified in Resend. Emails go
   out as `UT Austin Co-Foundr <meetups@mamuncofoundr.com>`.

## Check it before turning the feature on

Use synthetic recipients only (Resend's `delivered@resend.dev`), never a real
student. Send each of the three emails with the example values above, and check:

- [ ] The **subject** is the one the code sends (for example
      "Hannah B. wants to meet, Tue Oct 20"), not the subject stored on the
      template. If the template's subject wins, the three variants all read the same.
- [ ] A note of `Tom & Jerry <b>hi</b>` shows exactly as typed: not as bold text
      (raw HTML would mean `{{{ }}}` is unescaped and our escaping is the only
      defense) and not as `&amp;` (that would mean Resend escapes too, so we
      would be escaping twice and should stop).
- [ ] With an empty note, check how the Note row looks. The proposal HTML always
      renders that row, so an empty note leaves a blank row unless the template
      hides it.
- [ ] With an empty building, check the line under the location (same caveat).
- [ ] The button opens the pair's chat on the school's subdomain.
- [ ] It renders in Gmail and Apple Mail on a phone-width screen.

## Turn it on

Set `MEETUPS_V1_ORGS=ut` in Vercel once all three templates are published and checked.
Until then the feature is off for every school and no meetup email is sent.
