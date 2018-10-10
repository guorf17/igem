CREATE TABLE `radio` (
 `coverImg` varchar(512) COLLATE utf8mb4_unicode_ci  COMMENT '图片',
 `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
 `playNum` varchar(100) COLLATE utf8mb4_unicode_ci  COMMENT '观看人数',
  `commentNum` varchar(100) COLLATE utf8mb4_unicode_ci  COMMENT '评论数',
   `collectNum` varchar(100) COLLATE utf8mb4_unicode_ci COMMENT '收藏数',
    `avid` varchar(100) COLLATE utf8mb4_unicode_ci COMMENT 'id',
    
 PRIMARY KEY (`avid`),
 KEY `avid` (`avid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题概述'


       