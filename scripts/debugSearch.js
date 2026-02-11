// server/scripts/debugSearch.js
const fetch = require("node-fetch");

// 🔑 PASTE TOKEN HERE
const ACCESS_TOKEN =
  "eyJraWQiOiJucF8xIiwiYWxnIjoiUlMyNTYifQ.eyJhY2NvdW50X2lkIjoiNjI2NDc4MzYyNTU5ODY5MzAzMiIsImFjY291bnRfdXVpZCI6ImY0OGYxZTYwLTE3OWQtNDdkYi04YjI5LWJjNzNhZmY2YWNiYyIsImFnZSI6MzQsImF1dGh6X2MiOiJlTnFWVlZHTzR6WU12WW94QnpEUTlrOS91eWs2S05BcEZwc0RHSXBNMit6SWtpRFNubkdMM3IyVVpEdWVUR1ozKzVYbzhZVjZJaCtaZng3SStBQVA2a0VieGhrWmdkUkVFRCtWNDFLblF6MzZDMXFvWjRTWHltaW5qQjlIN2RvUzdJSGZnN1NEanVHVmI1a0hzREJaVzk4clJyWkFuMCtGR1lnVU9sRUIrZHpDakFaVStncXZ3Zm9vMy9VSVZCOFJZaDl4eFZMMENWclVaNGo1cDhiNnFjM0lvN1lXNHZJQnpUdnk4bHdKb092LzhKUHJvWjVDcXhtcUkvWVkvUlJLdWJZS3JmbStSVW52SGNDRzgwSU1venI4RU51Ry9UTTRwZHZKY2pORHhBNmxOT2hkUTZ4NW9nT2xoK3ZoZ3BHSExHK0hjb2tkTjRhanZhSklqUm5RdGxmRU80c09HaFRJUFVvaFBsMXRjR3c2U2pacnNRZG40SXZWM1BrNHF2RFRMNjRJdnhjbDZFZFJzQk1pRUo5MDRFbTZkQ2pGc3g3MVg2aU1qdHhjcHNYNWx6dFFFeUprSGNmUUxTYjJnMmlnY1ZLeEdUWTRkYmV4U1B0Tm9xZkplcHkyalFoTWxrdENhU01rOG42SXJjMHZPQnpKRENBTmdpTzJ1bU5GcG1oM2RkWXYydktTTFZBNWVLSGZBRnFWQmFTUkU2dlZGcCtoOG5yaVFla1FvcCtoU1FmWE1KcG51YnVFSXVqMkJnL2dwSEhCNmdYaVY4Z0ZjRzMyQzZtQ2xrRUlKRU5YeHVkMzEvbE5iWWFUcmk4Uk91bVBkTzhhRWd0WmxMS0lvbnphM1BCemJXVE9xakRSOEtmbjNhRHFCUzVubjJSdFBoY0hPakJjN2JsL2xTRy9qdGprT0M0bjd6cnM2L1MwS3JMNUhMSHRRYzFlS0tkQjg1NkRkQWRTdzlYVXRaYldMWDlEUlJjOTdNckVndEpIU1ZvUG1vYUtUQVJ3TkdpeFcyNEVnWTVtVU91cXlYVlpJZklHdFYwUklubk5rOXpRUTFSQmZMYWNDMVpUSHRpdFFyZk1YTzRiNm1HMi93ZDl2NEJaOWdncDMzV25kU01WYTY4SlB3eUhTY0w1VGRzV0x3dm9qcXJwSW5YQ1VDemp5MmVKWk82VENCUzlhaXlmZGRwQ1VOYjJwdkl1YjkvMmJFZ1dRZTU1TFU2cXBTbnBWd2srU3RyZzZNT3dLQzA3Q3VZOGxFZXhhN1NGRGgwbXBYZUNJZUtzelhJbmtxNDdsNXI5V0hSOTRPVEU0OUJ1bFh6eWFmVGY3RVpoelBDcTVCOUlGbmJlSkRselNpbFB5VTZ2TlhQRXk4VHl6elJyaXlYekc0SU1kbHBHWlpwRVF3dnZzNlFKbDl0V3puZkNtLzRQR1Y5bElVZk1PK2ljLzEzZVozd0hiSzZydDBKdmpEZTd3QjBPZHp6emJmN3VuYktaZkNlRi9zaS8zNkdVK3g3Ky9ROUJ0bk9SIiwiY2xpZW50X2lkIjoiMDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxIiwiZGNpbV9pZCI6ImNlMmZlODJkLTJjOWUtNGI1OC05Y2JmLWM1OWZjM2E4NmU0NSIsImVudl9pc3NfaWQiOiIyNTYiLCJleHAiOjE3NzA3Njk4NTIsImdyYW50X3R5cGUiOiJhdXRob3JpemF0aW9uX2NvZGUiLCJpYXQiOjE3NzA3NjYyNTIsImlzX2NoaWxkIjpmYWxzZSwiaXNzIjoiaHR0cHM6Ly9hdXRoLmFjY291bnQuc29ueS5jb20vIiwianRpIjoiNTNjZTdiYWEtM2VmOC00ZDQxLWE0MDUtZjgwNDJlMmVhMmRjIiwibGVnYWxfY291bnRyeSI6IkZSIiwibG9jYWxlIjoiZnItRlIiLCJ1c2VyX2RldmljZV9pcCI6Ijg2LjI1Mi40Mi4yNDIiLCJ2ZXIiOiIyIn0.FyFUlZDPMeniBOdi1GXoHOehhFHENoJrO81zxFZAVX0u3pcJY-NrsVgJ97zz1OJ-VQilFJ6LyC3g9gJRBcn7gu87Kc_PutOVbKP2sIoO58BMFiuWOfWSvt9gOMqMsoEFnXUbxg_WnY51OFrD6URXmk9vv1VRWDu3kWSHjY_BBcTwBiB2GFvhCg_jPcIhaei_Ry81b0c1IBaM1cb_tCcKehNL_ptDKKMRnLIBTOjG5htytAHqBKHf0-xR_f1Y4RDLIIp_HBcgx3JjAfz_A-t7E_LcNxhpESmjfmz22u7FTMWn-nj5bV4FxfyFR4iD1n3xUsMjTe0d7NilAvdHC1GjWdKfQLosP4FCLFYVCchqNvbSnoMDFFaNdeCKCSmj4ez-ejORAMQkQLUU2-vpbp0B_2GxDc1e1lvBe8dq6LIoZ9B8rs6PvbVnSxwBQDcAu21g6oAuxnIkz_cNpr3EDuHzPmhhMjq19wsCL1yDAvT-WYi7Z1Wm9d1wTWiIqEmLcz73";

async function testSearch(query, domain) {
  const url = `https://m.np.playstation.com/api/search/v1/universalSearch`;
  const body = {
    searchTerm: query,
    domainRequests: [
      {
        domain: domain,
        pagination: { pageSize: 5, offset: 0 },
      },
    ],
    countryCode: "US",
    languageCode: "en",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "User-Agent": "TrophyApp/1.0.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) return "❌ 401 Unauthorized (Token Invalid)";
    if (res.status === 403) return "❌ 403 Forbidden (Scope/Age Issue)";

    const data = await res.json();
    const count = data.domainResponses?.[0]?.totalResults || 0;
    const firstMatch = data.domainResponses?.[0]?.results?.[0]?.name || "None";

    return `✅ ${count} found. Top: "${firstMatch}"`;
  } catch (e) {
    return `❌ Error: ${e.message}`;
  }
}

async function run() {
  console.log("🕵️‍♀️ SEARCH DIAGNOSTIC TOOL");
  console.log("------------------------------------------------");

  const queries = ["Astro Bot", "God of War", "Prototype"];
  const domains = ["ConceptGameMobileApp", "MetadatabaseGame", "TacticalGame"];

  for (const q of queries) {
    console.log(`\n🔍 Query: "${q}"`);
    for (const d of domains) {
      const result = await testSearch(q, d);
      console.log(`   [${d}]: ${result}`);
    }
  }
}

run();
