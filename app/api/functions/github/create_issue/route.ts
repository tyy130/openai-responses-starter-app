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

    const { owner, repo, title, body, labels = [] } = await request.json();

    if (!owner || !repo || !title) {
      return NextResponse.json(
        { error: "owner, repo, and title are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
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
          body: body || "",
          labels,
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

    const issue = await response.json();

    return NextResponse.json({
      ok: true,
      issue: {
        number: issue.number,
        title: issue.title,
        html_url: issue.html_url,
        state: issue.state,
        created_at: issue.created_at,
      },
    });
  } catch (error) {
    console.error("github_create_issue error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
