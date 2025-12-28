import { NextResponse } from "next/server";
import { getGithubAccessToken } from "@/lib/connectors-auth";

export async function POST(request: Request) {
  try {
    const githubToken = await getGithubAccessToken();

    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub not connected. Please connect GitHub first." },
        { status: 401 }
      );
    }

    const { owner, repo, title, head, base, body = "" } = await request.json();

    if (!owner || !repo || !title || !head || !base) {
      return NextResponse.json(
        { error: "owner, repo, title, head, and base are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          title,
          head,
          base,
          body,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `GitHub API error: ${errorText}` },
        { status: response.status }
      );
    }

    const pr = await response.json();

    return NextResponse.json({
      ok: true,
      pull_request: {
        number: pr.number,
        title: pr.title,
        html_url: pr.html_url,
        state: pr.state,
        head: pr.head?.ref,
        base: pr.base?.ref,
        created_at: pr.created_at,
      },
    });
  } catch (error) {
    console.error("github_open_pr error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
