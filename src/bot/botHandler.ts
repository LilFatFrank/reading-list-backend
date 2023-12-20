import TelegramBot from "node-telegram-bot-api";
import config from "../config";
import { Request, Response } from "express";
import { addResource } from "../controllers/resourceController";

// Replace with the token given by BotFather
const token = config.botKey!;
const bot = new TelegramBot(token, { polling: true });

const typeOptions = ['news', 'reads', 'tweet', 'media', 'data'];
const categoryOptions = ['defi', 'infra', 'nft', 'gaming'];

const chatResourceStates = new Map();

bot.onText(/\/add/, (msg) => {
  const chatId = msg.chat.id;
  chatResourceStates.set(chatId, { step: "awaiting_title", data: {} });
  bot.sendMessage(chatId, "Please send the title of the resource:");
});

bot.on("message", (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;
  const state = chatResourceStates.get(chatId);

  if (!state) return;

  switch (state.step) {
    case "awaiting_title":
      state.data.title = msg.text;
      state.step = "awaiting_url";
      bot.sendMessage(chatId, "Please send the URL of the resource:");
      break;
    case "awaiting_url":
      state.data.url = msg.text;
      state.step = "awaiting_type";
      bot.sendMessage(chatId, 'Choose the type of the resource:\n' + typeOptions.map((option, index) => `${index + 1}. ${option}`).join('\n'));
      break;
    case "awaiting_type":
      const typeIndex = parseInt(msg.text) - 1;
      if (typeIndex >= 0 && typeIndex < typeOptions.length) {
        state.data.type = typeOptions[typeIndex];
        state.step = "awaiting_category";
        bot.sendMessage(chatId, 'Choose the category of the resource:\n' + categoryOptions.map((option, index) => `${index + 1}. ${option}`).join('\n'));
      } else {
        bot.sendMessage(chatId, 'Invalid selection. Please choose a valid type number.');
      }
      break;
    case "awaiting_category":
      const categoryIndex = parseInt(msg.text) - 1;
      if (categoryIndex >= 0 && categoryIndex < categoryOptions.length) {
        state.data.category = categoryOptions[categoryIndex];
        handleResourceData(state.data, chatId);
        chatResourceStates.delete(chatId);
      } else {
        bot.sendMessage(chatId, 'Invalid selection. Please choose a valid category number.');
      }
      break;
  }
});

async function handleResourceData(data: any, chatId: number) {
  try {
    // You need to create a mock Request and Response object for addResource
    const mockReq = {
      body: data,
    } as Request;
    const mockRes = {
      status: (statusCode: number) => ({
        json: (responseData: any) => {
          if (statusCode === 201) {
            bot.sendMessage(chatId, "Resource added successfully!");
          } else {
            throw new Error(responseData.error);
          }
        },
      }),
    } as Response;

    await addResource(mockReq, mockRes);
  } catch (error) {
    console.error("Error adding resource:", error);
    bot.sendMessage(chatId, "Failed to add the resource.");
  }
}

export default bot;
