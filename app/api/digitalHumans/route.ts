import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { agentId, agentName, roomId, userId } = await req.json();

    // === Register Agent ===
    const registerResponse = await fetch(
      "https://aigc-aiagent-api.zegotech.cn?Action=RegisterAgent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AgentId: agentId,
          Name: agentName,
          LLM: {
            Url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
            ApiKey: "7ef5ad0e5bb3b97fb13ff842d1122837", // Replace with your key in production
            Model: "doubao-lite-32k-240828",
            SystemPrompt:
              "You are an AI Agent, please answer the user's question.",
          },
          TTS: {
            Vendor: "ByteDance",
            Params: {
              app: {
                appid: "293628284",
                token: "7ef5ad0e5bb3b97fb13ff842d1122837",
                cluster: "volcano_tts",
              },
              audio: {
                voice_type: "zh_female_wanwanxiaohe_moon_bigtts",
              },
            },
          },
        }),
      }
    );

    const registerData = await registerResponse.json();
    console.log("✅ Agent registered:", registerData);

    // === Create Digital Human Instance ===
    const rtcInfo = {
      RoomId: roomId,
      AgentStreamId: `agent_${Date.now()}`,
      AgentUserId: `agent_${Date.now()}`,
      UserStreamId: `${userId}_stream`,
    };

    const digitalHuman = {
      PublicId: "c4b56d5c-db98-4d91-86d4-5a97b507da97", // test ID
    };

    const createInstanceResponse = await fetch(
      "https://aigc-aiagent-api.zegotech.cn?Action=CreateDigitalHumanAgentInstance",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AgentId: agentId,
          UserId: userId,
          RTC: rtcInfo,
          DigitalHuman: digitalHuman,
          MessageHistory: { SyncMode: 1, Messages: [], WindowSize: 10 },
        }),
      }
    );

    const instanceData = await createInstanceResponse.json();
    console.log("✅ Digital Human created:", instanceData);

    return NextResponse.json(instanceData);
  } catch (error) {
    console.error("❌ Error in Digital Human setup:", error);
    return NextResponse.json(
      { error: "Failed to create Digital Human instance" },
      { status: 500 }
    );
  }
}
