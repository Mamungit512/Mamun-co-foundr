# Meetup email template (Resend)

One hosted template drives all three meetup emails (proposed, accepted,
declined). The HTML is `ut-meetup.html` in this folder. The template lives in
Resend; this copy is the source to paste in and to restore from.

## Create it in Resend

1. Templates, Create template. Name it "UT Meetup". Paste `ut-meetup.html`.
2. Set the **alias** to `ut-meetup-07`. This must match
   `emailTemplates.meetup` for `ut` in `src/features/school/registry/registry.ts`.
3. Declare these 11 variables, all type **string**, each with a **fallback of a
   single space**. The code always sends all 11. The fallback only matters if
   Resend treats an empty string as "missing", which would otherwise show the
   fallback text in place of an empty note.

   | Variable | Example |
   | --- | --- |
   | `primaryColor` | `#BF5700` |
   | `wordmark` | `University of Texas at Austin` |
   | `heading` | `Hannah wants to meet you on campus` |
   | `body` | `Accept or decline from your chat with Hannah.` |
   | `locationName` | `Texas Union, Main Lounge` |
   | `locationDetail` | `Texas Union` (empty when the spot has no building) |
   | `whenLabel` | `Tue Oct 20 · 4:00 PM Central` |
   | `noteLabel` | `Note` (empty when there is no note, or on a decline) |
   | `noteText` | `“Coffee and compare notes on the pitch?”` (empty likewise) |
   | `ctaLabel` | `Respond` |
   | `ctaUrl` | `https://ut.mamuncofoundr.com/matches/<conversation id>` |

4. **Publish** it. Only published templates can be used when sending.
5. The sending domain `mamuncofoundr.com` must be verified in Resend. Emails go
   out as `UT Austin Co-Foundr <meetups@mamuncofoundr.com>`.

## Check it before turning the feature on

Use synthetic recipients only (Resend's `delivered@resend.dev`), never a real
student. Send each variant with the example values above, and check:

- [ ] The **subject** is the one the code sends (for example
      "Hannah B. wants to meet, Tue Oct 20"), not the subject stored on the
      template. If the template's subject wins, the three variants all read the same.
- [ ] A note of `Tom & Jerry <b>hi</b>` shows exactly as typed: not as bold text
      (raw HTML would mean `{{{ }}}` is unescaped and our escaping is the only
      defense) and not as `&amp;` (that would mean Resend escapes too, so we
      would be escaping twice and should stop).
- [ ] With an empty note, the Note row is gone and leaves no gap.
- [ ] With an empty building, the line under the location is gone.
- [ ] The button opens the pair's chat on the school's subdomain.
- [ ] It renders in Gmail and Apple Mail on a phone-width screen.

## Turn it on

Set `MEETUPS_V1_ORGS=ut` in Vercel once the template is published and checked.
Until then the feature is off for every school and no meetup email is sent.
