-- CREATE TABLE Guild(
--     guildID VARCHAR(50) PRIMARY KEY,
--     guildPrefix VARCHAR(10),
--     guildMessageXP INT,
--     guildVoiceXP INT,
--     guildMessageCooldown BIGINT,
--     guildVoiceCooldown BIGINT,
--     equation INT,
--     base INT,
--     modifier INT
-- );

-- CREATE TABLE GuildIgnoreChannel
-- (
--     channelID VARCHAR(50) PRIMARY KEY,
--     guildID VARCHAR(50),
--     FOREIGN KEY (guildID) REFERENCES Guild(guildID)
-- );

-- CREATE TABLE GuildClan
-- (
--     guildID VARCHAR(50),
--     clanID INT IDENTITY(100000, 1) PRIMARY KEY,
--     clanName VARCHAR(255),
--     clanLeaderID VARCHAR(50),
--     clanDescription VARCHAR(500),
--     clanLevel INT,
--     clanType VARCHAR(50),
--     clanWins INT
--     FOREIGN KEY (guildID) REFERENCES Guild(guildID)
-- );

-- CREATE TABLE UserProfile
-- (
--     guildID VARCHAR(50),
--     clanID INT,
--     userID VARCHAR(50),
--     userXP INT,
--     FOREIGN KEY (guildID) REFERENCES Guild(guildID),
--     FOREIGN KEY (clanID) REFERENCES GuildClan(clanID)
-- );

-- CREATE TABLE ClanMember
-- (
--     guildID VARCHAR(50),
--     clanID INT,
--     userID VARCHAR(50),
--     role VARCHAR(50),
--     contribution INT,
--     FOREIGN KEY (clanID) REFERENCES GuildClan(clanID)
-- );


 ALTER TABLE ClanMember ADD guildID VARCHAR(50);
-- UPDATE table_name
-- SET column1 = value1, column2 = value2, ...
-- WHERE condition;

USE Chron;

SELECT *
FROM UserProfile WHERE (userID = '428832564514390019') AND guildID = '575341681596039178';

SELECT * FROM Guild WHERE guildID = '575341681596039178';

SELECT * FROM GuildClan

SELECT * FROM ClanMember

ALTER TABLE GuildClan ALTER COLUMN guildMessageCooldown BIGINT;
ALTER TABLE Guild ALTER COLUMN guildVoiceCooldown BIGINT;

--rename
EXEC sp_rename 'dbo.Guild.guildChatXP', 'guildMessageXP', 'COLUMN'

INSERT INTO Guild
    (guildID, guildPrefix, guildMessageXP, guildVoiceXP)
VALUES('575341681596039178', '?', 7, 7);



UPDATE UserProfile SET clanID = NULL WHERE userID = '428832564514390019'
UPDATE GuildClan SET clanDescription = 'nonas playhouse' WHERE clanLeaderID = '428832564514390019'

DELETE FROM ClanMember WHERE userID = '428832564514390019'

DELETE FROM GuildClan WHERE guildID = '875689127310413864' AND clanLeaderID = '428832564514390019'


DELETE FROM UserProfile WHERE  userID = '428832564514390019'