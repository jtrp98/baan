# ใบงาน028 — gm แก้คำอ้างสถานะก่อนใช้ร่างqueue/backlog

วันที่2026-10-23 · gm t2 read-only · ใช้AGYเพราะClaudeweeklylimit (Codexสุดท้าย)

ร่างของคุณที่ planning/gm-evidence-response-001.json DONEจากtask027 ยังไม่ได้applyเพราะผู้คุมพบถ้อยคำเกินหลักฐาน3จุดในproposed backlognew: (1) BL002 'ไม่บล็อก AC ของ SchoolBot เพราะฝั่ง SchoolBot บังคับกรอง SchoolId และ fail-closed...' ทั้งที่ยังไม่มีimplementation/runtimeproof (2) BL003 'ฝั่ง SchoolBot บังคับกรอง SchoolId ทุก join...' เป็นเพียงสัญญา (3) BL002 'ผิด key จาก nSystemID' ต้นฉบับเองขัดกันและยังไม่พิสูจน์datarelation จึงควรว่าใช้sIDในWorkStatusต่างจากnSystemIDในidentityไม่ฟันธงkeyผิด

ขอownerแก้เป็นcontract-required/pendingimplementation และไม่ตัดสินว่าจะบล็อกACแทนcheck/jpo. ไม่เปลี่ยนBL IDs/รายละเอียดหลักฐานอื่น ไม่รับriskหรือเพิ่มscope. queue003กล่าวtask023ยังไม่มีoutputตอนสร้างร่างถูกตามsnapshot แต่ให้ขึ้นต้นประโยคสถานะด้วย 'ณ ตอนจัดทำqueue003' และบอกอ่านplanning/handoff-002.mdที่ผู้คุมจะบันทึกหลังรับarchเป็นสถานะรับล่าสุด ไม่สร้างhandoffเอง. ไม่สมมติผลarch AGYที่ยังรัน ไม่ต้องอ่านsource/planJSONทั้งก้อน

อ่านindex-firstแล้วเฉพาะplanning/gm-evidence-response-001.json และtask028นี้. คืนfencedJSONเดียว<=2000tokens {"state":"DONE","summary":"...","json_replacements":[{"pointer":"/edits/0/new หรือ /new_files/0/content","old":"exact unique substringในJSONร่างที่decodedแล้ว","new":"..."}],"handoff":["..."]}. ผู้คุมจะเก็บoriginalresponseไว้ ใช้replacementsกับสำเนาร่างก่อนapply ไม่แก้metadata/taskstatus/REQscope. ไม่มีfilewrites/git/SQL/role

## Change Log
- 2026-10-23 — ผู้คุมส่งfactualclaimให้เจ้าของแผนแก้ก่อนapply ไม่ใช้draftรับรองruntime
