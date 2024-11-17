import express from "express";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import config from "./config/configDB";
import Users from "./modules/Users";
import initRoutes from "./routers";
import cors from "cors"; // Import CORS
import Conversations from "./modules/Conversations";
interface CreateChatPayload {
  participants: string[]; // Mảng ID người tham gia
  isGroup: boolean; // Trạng thái nhóm
  idUser: string; // ID người dùng
}
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://192.168.1.43:3000", // Allow this origin
    methods: ["GET", "POST"], // Specify allowed HTTP methods
    allowedHeaders: ["my-custom-header"],
    credentials: true, // Allow credentials to be included
  },
});

const PORT = process.env.PORT || 8080;

// CORS options for Express
const corsOptions = {
  origin: "http://localhost:3000", // Allow this origin
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true, // Allow credentials to be included
};

// Enable CORS for Express routes
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
initRoutes(app);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("userLogin", async (data) => {
    console.log(` User login: ${data.email} at ${data.timestamp} `);
  });
  socket.on("createChat", async (payload: CreateChatPayload) => {
    const { participants, isGroup, idUser } = payload;
    console.log("Yêu cầu tạo chat:", idUser);

    try {
      // Tìm cuộc trò chuyện đã tồn tại
      const existingChats = await Conversations.findOne({
        participants: participants, // Kiểm tra nếu cần cho loại cuộc trò chuyện
      });

      if (existingChats) {
        socket.emit("chatCreated", { chatId: existingChats._id.toString() });
        console.log(
          "Cuộc trò chuyện được tìm thấy:",
          existingChats._id.toString()
        );
      } else {
        // Tạo cuộc trò chuyện mới nếu không tìm thấy
        const newChat = new Conversations({
          participants,
          isGroup,
          createdAt: new Date(), // Thời gian tạo
        });

        await newChat.save(); // Lưu cuộc trò chuyện mới vào cơ sở dữ liệu
        console.log("Cuộc trò chuyện mới được tạo:", newChat);
        socket.emit("chatCreated", { chatId: newChat._id.toString() }); // Phát sự kiện với _id của cuộc trò chuyện mới
      }
    } catch (error) {
      console.error("Lỗi khi xử lý createChat:", error);
      socket.emit("error", { message: "Tạo cuộc trò chuyện thất bại" }); // Phát sự kiện lỗi nếu có
    }
  });

  socket.on("userLogout", async (data) => {
    console.log(
      `id ${data.id} User logout : ${data.email} at ${data.timestamp}`
    );
    try {
      await Users.findOneAndUpdate(
        { _id: data.id }, // Tìm theo id
        {
          lastLogout: new Date(data.timestamp),
          isOnline: false,
        }
      );
    } catch (error) {
      console.error("Error updating user logout:", error);
    }

    // Thực hiện logic bổ sung cho người dùng đã đăng nhập
    // Ví dụ: có thể lưu trữ thông tin người dùng, thông báo cho các client khác, v.v.
  });

  socket.on("message", (messageData) => {
    console.log("Message received:", messageData);

    // io.emit("message", messageData); // Hoặc socket.broadcast.emit nếu bạn không muốn gửi lại cho người gửi
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// Routes
app.get("/home", (req, res) => {
  res.render("../src/views/home.ejs");
});

app.get("/", (req, res) => {
  res.send("<h1>Hello Socket.IO</h1>");
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
