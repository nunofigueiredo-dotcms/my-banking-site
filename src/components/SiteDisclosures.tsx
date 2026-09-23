import Link from "next/link";

/**
 * Standard US retail-bank disclosures, with the regulators they cite, plus
 * links into the rest of the site. Rendered inside <main> so search and AI
 * engines read the citations as part of the page content, not the chrome.
 */
export default function SiteDisclosures() {
  return (
    <section className="site-disclosures" aria-labelledby="disclosures-heading">
      <h2 id="disclosures-heading">Important information</h2>
      <ul>
        <li>
          Member FDIC. Deposits are insured up to $250,000 per depositor, per insured bank, for
          each account ownership category. See{" "}
          <a href="https://www.fdic.gov/resources/deposit-insurance" target="_blank" rel="noopener noreferrer">
            FDIC deposit insurance coverage
          </a>
          .
        </li>
        <li>
          APY is the Annual Percentage Yield, calculated as defined by{" "}
          <a href="https://www.ecfr.gov/current/title-12/chapter-X/part-1030" target="_blank" rel="noopener noreferrer">
            Regulation DD (Truth in Savings), 12 CFR Part 1030
          </a>
          . Rates may change after an account is opened.
        </li>
        <li>
          Mortgage rates shown are examples. For current national averages, see{" "}
          <a href="https://www.freddiemac.com/pmms" target="_blank" rel="noopener noreferrer">
            Freddie Mac&apos;s Primary Mortgage Market Survey
          </a>
          .
        </li>
        <li>
          Equal Housing Lender. We do business in accordance with the{" "}
          <a href="https://www.hud.gov/fairhousing" target="_blank" rel="noopener noreferrer">
            Fair Housing Act (HUD)
          </a>
          .
        </li>
        <li>
          We will never ask for your password by email or text. Learn{" "}
          <a
            href="https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams"
            target="_blank"
            rel="noopener noreferrer"
          >
            how to recognize and avoid phishing scams (FTC)
          </a>
          .
        </li>
      </ul>
      <p className="site-disclosures__links">
        <Link href="/">Compare accounts</Link>
        <Link href="/blog">Read our money guides</Link>
        <Link href="/about-us">About us</Link>
      </p>
    </section>
  );
}
