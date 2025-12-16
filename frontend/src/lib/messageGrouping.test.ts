import { describe, it, expect } from "vitest";
import { groupMessagesIntoExchanges } from "./messageGrouping";
import type { Message } from "../types";
import {
  mockMessages,
  mockOutputs,
  mockMessagesWithRetries,
  mockOutputsMultiple,
} from "../test/fixtures";

describe("groupMessagesIntoExchanges", () => {
  it("should group a simple user-assistant exchange", () => {
    const exchanges = groupMessagesIntoExchanges(mockMessages, mockOutputs);

    expect(exchanges).toHaveLength(1);
    expect(exchanges[0].user.id).toBe("msg-1");
    expect(exchanges[0].assistant?.id).toBe("msg-2");
    expect(exchanges[0].output?.id).toBe("output-1");
  });

  it("should return empty array for empty messages", () => {
    const exchanges = groupMessagesIntoExchanges([], []);

    expect(exchanges).toHaveLength(0);
  });

  it("should include user message without assistant response (draft/pending)", () => {
    const userOnly: Message[] = [
      {
        id: "msg-1",
        case_id: "case-123",
        role: "user",
        content: "Question without response",
        created_at: "2024-01-01T10:00:00Z",
      },
    ];

    const exchanges = groupMessagesIntoExchanges(userOnly, []);

    expect(exchanges).toHaveLength(1); // Include incomplete exchange for draft/pending
    expect(exchanges[0].user.id).toBe("msg-1");
    expect(exchanges[0].assistant).toBeNull();
    expect(exchanges[0].output).toBeUndefined();
  });

  it("should take the latest assistant message when there are retries", () => {
    const exchanges = groupMessagesIntoExchanges(
      mockMessagesWithRetries,
      mockOutputsMultiple,
    );

    expect(exchanges).toHaveLength(2);
    // First exchange should have the retry response (latest)
    expect(exchanges[0].assistant?.id).toBe("msg-3");
    expect(exchanges[0].assistant?.content).toBe("Retry response (latest)");
    // Second exchange should be normal
    expect(exchanges[1].assistant?.id).toBe("msg-5");
  });

  it("should correctly associate outputs with exchanges", () => {
    const exchanges = groupMessagesIntoExchanges(mockMessages, mockOutputs);

    expect(exchanges[0].output).toBeDefined();
    expect(exchanges[0].output?.result_json.executive_summary).toBe(
      "This is a test summary of the ethical guidance.",
    );
  });

  it("should handle missing output gracefully", () => {
    const messagesWithMissingOutput: Message[] = [
      {
        id: "msg-1",
        case_id: "case-123",
        role: "user",
        content: "Question",
        created_at: "2024-01-01T10:00:00Z",
      },
      {
        id: "msg-2",
        case_id: "case-123",
        role: "assistant",
        content: "Response",
        output_id: "non-existent",
        created_at: "2024-01-01T10:01:00Z",
      },
    ];

    const exchanges = groupMessagesIntoExchanges(messagesWithMissingOutput, []);

    expect(exchanges).toHaveLength(1);
    expect(exchanges[0].output).toBeUndefined();
  });

  it("should handle multiple complete exchanges", () => {
    const multipleExchanges: Message[] = [
      {
        id: "msg-1",
        case_id: "case-123",
        role: "user",
        content: "First question",
        created_at: "2024-01-01T10:00:00Z",
      },
      {
        id: "msg-2",
        case_id: "case-123",
        role: "assistant",
        content: "First response",
        created_at: "2024-01-01T10:01:00Z",
      },
      {
        id: "msg-3",
        case_id: "case-123",
        role: "user",
        content: "Second question",
        created_at: "2024-01-01T10:05:00Z",
      },
      {
        id: "msg-4",
        case_id: "case-123",
        role: "assistant",
        content: "Second response",
        created_at: "2024-01-01T10:06:00Z",
      },
    ];

    const exchanges = groupMessagesIntoExchanges(multipleExchanges, []);

    expect(exchanges).toHaveLength(2);
    expect(exchanges[0].user.content).toBe("First question");
    expect(exchanges[0].assistant?.content).toBe("First response");
    expect(exchanges[1].user.content).toBe("Second question");
    expect(exchanges[1].assistant?.content).toBe("Second response");
  });

  it("should correctly order exchanges by timestamp", () => {
    // Messages out of order but with correct timestamps
    const outOfOrderMessages: Message[] = [
      {
        id: "msg-3",
        case_id: "case-123",
        role: "assistant",
        content: "First response",
        created_at: "2024-01-01T10:01:00Z",
      },
      {
        id: "msg-1",
        case_id: "case-123",
        role: "user",
        content: "First question",
        created_at: "2024-01-01T10:00:00Z",
      },
      {
        id: "msg-4",
        case_id: "case-123",
        role: "assistant",
        content: "Second response",
        created_at: "2024-01-01T10:06:00Z",
      },
      {
        id: "msg-2",
        case_id: "case-123",
        role: "user",
        content: "Second question",
        created_at: "2024-01-01T10:05:00Z",
      },
    ];

    const exchanges = groupMessagesIntoExchanges(outOfOrderMessages, []);

    expect(exchanges).toHaveLength(2);
    // Should still group correctly based on timestamps
    expect(exchanges[0].user.content).toBe("First question");
    expect(exchanges[1].user.content).toBe("Second question");
  });
});
