import type OpenAI from "openai";

export const OPENAI_TOOL_DEFINITIONS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "send_rfq",
      description:
        "Send RFQ messages to suppliers after Layla confirmed line items. Simulates email/WhatsApp send in hackathon demo.",
      parameters: {
        type: "object",
        properties: {
          request_id: { type: "string" },
          supplier_ids: {
            type: "array",
            items: { type: "string" },
            description: "Supplier ids e.g. cairo-dairy, bean-barrel",
          },
          line_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sku: { type: "string" },
                name: { type: "string" },
                qty: { type: "number" },
                unit: { type: "string" },
                branchId: {
                  type: "string",
                  enum: ["zamalek", "maadi", "new-cairo"],
                },
              },
              required: ["sku", "name", "qty", "unit", "branchId"],
            },
          },
          delivery_branch: { type: "string" },
          needed_by: { type: "string" },
        },
        required: ["request_id", "supplier_ids", "line_items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "parse_quote_reply",
      description:
        "Parse unstructured supplier reply into structured quote lines. Use raw_text AUTO to use hackathon mock reply.",
      parameters: {
        type: "object",
        properties: {
          rfq_id: { type: "string" },
          supplier_id: { type: "string" },
          raw_text: { type: "string" },
        },
        required: ["rfq_id", "supplier_id", "raw_text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_quotes",
      description: "Build side-by-side comparison matrix and unit-cost metrics.",
      parameters: {
        type: "object",
        properties: {
          request_id: { type: "string" },
          quote_ids: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["request_id", "quote_ids"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recommend",
      description:
        "Produce one split-order recommendation with rationale and optional fallback note.",
      parameters: {
        type: "object",
        properties: {
          request_id: { type: "string" },
          comparison_id: { type: "string" },
          constraints: {
            type: "object",
            properties: {
              max_suppliers: { type: "number" },
              prefer_local: { type: "boolean" },
            },
          },
        },
        required: ["request_id", "comparison_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_inventory",
      description:
        "Apply approved recommendation to branch inventory ledger after Layla approves.",
      parameters: {
        type: "object",
        properties: {
          request_id: { type: "string" },
          recommendation_id: { type: "string" },
          approved_by: { type: "string" },
        },
        required: ["request_id", "recommendation_id", "approved_by"],
      },
    },
  },
];
