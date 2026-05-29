export const diagnosticCards = [
  { id: 'leaderboard', title: '新建排行榜活动', icon: 'Trophy', color: 'from-tiktok-pink to-orange-500', aiBadge: null, desc: '创建标准排行榜活动，按积分指标排名发放奖励' },
  { id: 'pk', title: '新建 PK 赛活动', icon: 'Swords', color: 'from-tiktok-purple to-tiktok-blue', aiBadge: '本周公会开播率下降15%，点击一键创建促活PK赛（AI推荐度 98%）', desc: '1v1或组队PK赛制，激发主播竞争动力' },
  { id: 'template', title: '活动模板库', icon: 'Library', color: 'from-tiktok-blue to-tiktok-cyan', aiBadge: null, desc: '浏览历史活动模板，快速复用配置' },
];

export const activities = [
  { id: '1234567878868768', name: 'King of creators competition', type: 'Leaderboard',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Private', creator: 'TestFaker_MENA', creatorTime: '03/24/2025 13:00:07',
    health: 'healthy', healthLabel: '稳步增长', diamondGoal: 10000, hourGoal: 35, dayGoal: 8 },
  { id: '1234567878868769', name: 'Summer PK Championship', type: 'Match challenge',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Public', creator: 'TestFaker_MENA', creatorTime: '03/24/2025 13:00:07',
    health: 'warning', healthLabel: '参与低迷', diamondGoal: 5000, hourGoal: 25, dayGoal: 7 },
  { id: '1234567878868770', name: 'New Talent Springboard', type: 'Leaderboard',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Private', creator: 'Ming_Chen_Official', creatorTime: '03/24/2025 13:00:07',
    health: 'danger', healthLabel: '严重亏损', diamondGoal: 3000, hourGoal: 15, dayGoal: 5 },
  { id: '1234567878868771', name: 'Dragon Boat Festival Bash', type: 'Match challenge',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Public', creator: 'Alice_Wong_Creator', creatorTime: '03/24/2025 13:00:07',
    health: 'healthy', healthLabel: '稳步增长', diamondGoal: 8000, hourGoal: 30, dayGoal: 7 },
  { id: '1234567878868772', name: 'Mid-Year Grand Gala', type: 'Leaderboard',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Private', creator: 'TestFaker_MENA', creatorTime: '03/24/2025 13:00:07',
    health: 'warning', healthLabel: '参与低迷', diamondGoal: 15000, hourGoal: 50, dayGoal: 15 },
  { id: '1234567878868773', name: 'Spring Creator Cup', type: 'Leaderboard',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Public', creator: 'Sarah_CreatorHub', creatorTime: '03/24/2025 13:00:07',
    health: 'healthy', healthLabel: '稳步增长', diamondGoal: 6000, hourGoal: 20, dayGoal: 6 },
  { id: '1234567878868774', name: 'Weekly Star Challenge', type: 'Match challenge',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Private', creator: 'TestFaker_MENA', creatorTime: '03/24/2025 13:00:07',
    health: 'healthy', healthLabel: '稳步增长', diamondGoal: 4000, hourGoal: 15, dayGoal: 5 },
  { id: '1234567878868775', name: 'Golden Mic Awards', type: 'Leaderboard',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Public', creator: 'Alice_Wong_Creator', creatorTime: '03/24/2025 13:00:07',
    health: 'healthy', healthLabel: '稳步增长', diamondGoal: 12000, hourGoal: 40, dayGoal: 10 },
  { id: '1234567878868776', name: 'Rising Stars Bootcamp', type: 'Match challenge',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Private', creator: 'Ming_Chen_Official', creatorTime: '03/24/2025 13:00:07',
    health: 'healthy', healthLabel: '稳步增长', diamondGoal: 3000, hourGoal: 10, dayGoal: 4 },
  { id: '1234567878868777', name: 'Summer Heat Marathon', type: 'Leaderboard',
    startDate: '06/23/2023 04:15:41 (UTC+03:00)', endDate: '06/23/2023 04:15:41 (UTC+03:00)',
    access: 'Public', creator: 'Sarah_CreatorHub', creatorTime: '03/24/2025 13:00:07',
    health: 'warning', healthLabel: '参与低迷', diamondGoal: 9000, hourGoal: 30, dayGoal: 9 },
];

export const hosts = [
  { id: 'H001', name: 'Nikilemon', avatar: 'NL', diamondCurrent: 8200, diamondGoal: 10000, hourCurrent: 25, hourGoal: 35, dayCurrent: 5, dayGoal: 8, targetMet: false, prediction: 'fail', predictionLabel: '预测未达标', color: '#ff2c55' },
  { id: 'H002', name: 'StarLight88', avatar: 'SL', diamondCurrent: 13800, diamondGoal: 10000, hourCurrent: 42, hourGoal: 35, dayCurrent: 9, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#20d5ec' },
  { id: 'H003', name: 'MayaMusic', avatar: 'MM', diamondCurrent: 6200, diamondGoal: 10000, hourCurrent: 18, hourGoal: 35, dayCurrent: 3, dayGoal: 8, targetMet: false, prediction: 'fail', predictionLabel: '预测未达标', color: '#7c3aed' },
  { id: 'H004', name: 'DJPhantom', avatar: 'DP', diamondCurrent: 9500, diamondGoal: 10000, hourCurrent: 32, hourGoal: 35, dayCurrent: 7, dayGoal: 8, targetMet: false, prediction: 'pass', predictionLabel: '预测稳过', color: '#f59e0b' },
  { id: 'H005', name: 'LunaWave', avatar: 'LW', diamondCurrent: 4200, diamondGoal: 10000, hourCurrent: 12, hourGoal: 35, dayCurrent: 4, dayGoal: 8, targetMet: false, prediction: 'fail', predictionLabel: '预测未达标', color: '#10b981' },
  { id: 'H006', name: 'AuroraSky', avatar: 'AS', diamondCurrent: 10000, diamondGoal: 10000, hourCurrent: 35, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#6366f1' },
  { id: 'H007', name: 'BlazeKing', avatar: 'BK', diamondCurrent: 7800, diamondGoal: 10000, hourCurrent: 30, hourGoal: 35, dayCurrent: 6, dayGoal: 8, targetMet: false, prediction: 'pass', predictionLabel: '预测稳过', color: '#f97316' },
  { id: 'H008', name: 'CrystalSea', avatar: 'CS', diamondCurrent: 12500, diamondGoal: 10000, hourCurrent: 35, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#14b8a6' },
  { id: 'H009', name: 'EchoWave', avatar: 'EW', diamondCurrent: 3500, diamondGoal: 10000, hourCurrent: 10, hourGoal: 35, dayCurrent: 3, dayGoal: 8, targetMet: false, prediction: 'fail', predictionLabel: '预测未达标', color: '#e11d48' },
  { id: 'H010', name: 'ZenMaster', avatar: 'ZM', diamondCurrent: 10000, diamondGoal: 10000, hourCurrent: 35, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#8b5cf6' },
  { id: 'H011', name: 'NeonFlare', avatar: 'NF', diamondCurrent: 11000, diamondGoal: 10000, hourCurrent: 38, hourGoal: 35, dayCurrent: 9, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#06b6d4' },
  { id: 'H012', name: 'SilverMoon', avatar: 'SM', diamondCurrent: 10000, diamondGoal: 10000, hourCurrent: 35, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#a855f7' },
  { id: 'H013', name: 'ThunderBolt', avatar: 'TB', diamondCurrent: 6800, diamondGoal: 10000, hourCurrent: 22, hourGoal: 35, dayCurrent: 5, dayGoal: 8, targetMet: false, prediction: 'fail', predictionLabel: '预测未达标', color: '#ef4444' },
  { id: 'H014', name: 'OceanBreeze', avatar: 'OB', diamondCurrent: 10000, diamondGoal: 10000, hourCurrent: 35, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#22c55e' },
  { id: 'H015', name: 'FireHeart', avatar: 'FH', diamondCurrent: 11500, diamondGoal: 10000, hourCurrent: 40, hourGoal: 35, dayCurrent: 10, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#f43f5e' },
  { id: 'H016', name: 'IceQueen', avatar: 'IQ', diamondCurrent: 10000, diamondGoal: 10000, hourCurrent: 35, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#3b82f6' },
  { id: 'H017', name: 'WildWolf', avatar: 'WW', diamondCurrent: 5100, diamondGoal: 10000, hourCurrent: 16, hourGoal: 35, dayCurrent: 4, dayGoal: 8, targetMet: false, prediction: 'fail', predictionLabel: '预测未达标', color: '#f97316' },
  { id: 'H018', name: 'MysticRose', avatar: 'MR', diamondCurrent: 10000, diamondGoal: 10000, hourCurrent: 35, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#ec4899' },
  { id: 'H019', name: 'DarkKnight', avatar: 'DK', diamondCurrent: 9200, diamondGoal: 10000, hourCurrent: 33, hourGoal: 35, dayCurrent: 7, dayGoal: 8, targetMet: false, prediction: 'pass', predictionLabel: '预测稳过', color: '#6b7280' },
  { id: 'H020', name: 'GoldenLion', avatar: 'GL', diamondCurrent: 10800, diamondGoal: 10000, hourCurrent: 36, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#eab308' },
  { id: 'H021', name: 'ShadowFox', avatar: 'SF', diamondCurrent: 3800, diamondGoal: 10000, hourCurrent: 14, hourGoal: 35, dayCurrent: 3, dayGoal: 8, targetMet: false, prediction: 'fail', predictionLabel: '预测未达标', color: '#78716c' },
  { id: 'H022', name: 'PearlDiver', avatar: 'PD', diamondCurrent: 10000, diamondGoal: 10000, hourCurrent: 35, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#14b8a6' },
  { id: 'H023', name: 'StormChaser', avatar: 'SC', diamondCurrent: 10000, diamondGoal: 10000, hourCurrent: 35, hourGoal: 35, dayCurrent: 8, dayGoal: 8, targetMet: true, prediction: 'pass', predictionLabel: '预测稳过', color: '#6366f1' },
];

export const aiDiagnosis = {
  '1234567878868769': { summary: '活动参与度持续走低', analysis: '当前达标率仅42%，Stage 2 参与门槛偏高（1200钻），导致大量中腰部主播放弃冲刺。钻石消费集中在前10%主播，长尾效应弱。', suggestions: ['建议在第二阶段派发一轮催播通知，附带限时双倍积分激励', '将 Stage 2 门槛从1200钻降至800钻，扩大达标覆盖面', '增开"幸运抽奖"环节，刺激低活跃主播参与意愿'] },
  '1234567878868770': { summary: 'ROI严重低于预期', analysis: '当前ROI仅0.42，总奖励支出已超预算23%。核心问题：头部主播垄断积分榜，腰部主播放弃参赛，导致整体开播时长反而下降。', suggestions: ['立即关闭钻石自选消费入口，切换为固定任务奖励模式', '调低前3名奖励系数，将预算重新分配给参与奖', '开启"每日达标打卡"机制，确保腰部主播持续开播'] },
};

export const aiNudgeScripts = {
  Nikilemon: `Nikilemon，你距离拿到阶段 1 奖金只差 **10 小时直播** 和 **3 天有效开播** 啦！\n\n端午节假期流量翻倍，现在正是冲刺的好时机！我帮你算了一下：\n- 每天播 2 小时，5 天就能达成时长目标\n- 钻石缺口 1,800，用双倍积分卡轻松补齐\n\n今晚开播冲刺一下，奖金轻松拿！加油~ 🚀`,
  MayaMusic: `MayaMusic，你的 Music LIVE Quest 旅程还没结束呢~\n\n距离 Stage 1 奖励还有 **1,800 钻** 和 **17 小时** 差距。不过我看到你的场均收入其实排在中位线以上，说明你不是做不到，只是播得太少啦。\n\n建议：周末连开两场主题直播（比如"午夜电台"），场均钻石很容易破 2,000。再搭配打卡任务，8 天目标也能完成！\n\n别让你的粉丝等太久，行动起来！💪✨`,
  LunaWave: `LunaWave，我注意到你这段时间开播少了，粉丝们都在问 Luna 去哪了 😢\n\nMusic LIVE Quest 还剩最后冲刺期，你只需要：\n- 补齐 **5,800 钻**（约 3-4 场直播）\n- 开够 **23 小时**（每天播 1.5 小时即可）\n- 完成 **4 天**有效开播\n\n提醒一下：阶段 1 奖金池还剩 32%，先到先得！赶紧回来领走属于你的那一份~ 🎁`,
};

export const recommendedGroups = [
  { id: 'low-active', name: '近期开播低迷组', count: 24, desc: '近14天开播时长低于公会均值50%', icon: 'TrendingDown', color: '#ff2c55' },
  { id: 'high-potential', name: '高潜力新秀组', count: 12, desc: '新主播中钻石增速Top 20%', icon: 'Sparkles', color: '#20d5ec' },
  { id: 'consistent', name: '稳定输出组', count: 36, desc: '连续30天达标的老主播', icon: 'Star', color: '#f59e0b' },
];

export const aiPresetCommands = [
  { label: '端午腰部主播促活，预算3万钻', value: 'dragon_boat_low_mid' },
  { label: '新主播冷启动激励，预算1.5万钻', value: 'new_host_cold_start' },
  { label: '头部主播冲榜赛，预算5万钻', value: 'top_host_championship' },
  { label: '全员开播时长激励，预算2万钻', value: 'all_host_duration_bonus' },
];
