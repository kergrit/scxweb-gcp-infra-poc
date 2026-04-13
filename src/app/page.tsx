import Image from "next/image";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

async function getDbTime() {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    // Format the time to be more readable    
    return new Date(rows[0].now).toString();
  } catch (error) {
    console.error("Database query failed:", error);
    // Check for specific properties if the error object is not a standard Error
    if (error instanceof Error) {
      return `DB Error: ${error.message}`;
    }
    return "DB Error: An unknown error occurred";
  }
}

export default async function Home() {
  const dbTime = await getDbTime();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-gray-200 dark:bg-gray-700 font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly. NOW YOU SEE ME !!
          </li>
          <li>[POC] CI/CD with connect github repository to cloud run</li>
          <li>[POC] Secret Manager. APP_VERSION: <code className="bg-gray-200 dark:bg-gray-700 font-mono font-semibold px-1 py-0.5 rounded">{process.env.APP_VERSION || "N/A"}</code></li>
          <li>[POC] CLoud SQL Connection. DB Times: <code className="bg-gray-200 dark:bg-gray-700 font-mono font-semibold px-1 py-0.5 rounded">{dbTime}</code></li>
          <li><a href="/media" className="text-blue-500 hover:underline">[POC] Cloud Stroage / Cloud CDN. Go to Media Management</a></li>
          <li><a href="/port-test" className="text-blue-500 hover:underline">[POC] Port Connection Test. Test connectivity to any server</a></li>
          <li><a href="/ip-check" className="text-blue-500 hover:underline">[POC] Outbound IP Check. Check Cloud Run outbound IP address</a></li>
          <li><a href="/email-test" className="text-blue-500 hover:underline">[POC] Email Test. Test SMTP email sending with various configurations</a></li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
