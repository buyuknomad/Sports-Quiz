// scripts/populate-inspiration-topics.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';


// Define the category type matching your DB enum
type Category = 'football' | 'basketball' | 'tennis' | 'olympics';

// Load environment variables from .env file in the parent directory
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required Supabase environment variables (VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY)');
  process.exit(1);
}

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log('Supabase client initialized.');

// --- Sample Inspiration List ---
// !!! IMPORTANT: REPLACE THE CONTENT INSIDE THE BACKTICKS BELOW WITH YOUR FULL LIST !!!
const sampleInspirationListText = `
Soccer (Football)

10 Goals in a Champions' League Season
2+ Teams Top Scorer in 2010s
200+ Post-war English League Goals
All Teams in La Liga History
All-Time Champions League Goalscorers
All-Time German Bundesliga Clubs
All-Time UEFA Champions League Teams
American EPL Goalscorers
American Soccer Players
An Introduction to Soccer
Anyone but Arsène Wenger
Argentine Soccer Players
Arsenal Top 3 Scorers by Season
At Least One World Cup Winner
Australian Soccer Players
Back-to-Back English Football Champions
Back-to-Back Premier League Golden Boots
Ballon d'Or & World Cup
Ballon d'Or 2018 Nominees
Ballon d'Or Winner & World Cup Finalist
Ballon d'Or Winners by Age
Belgian Soccer Players
Best Average Finish: Premier League
Brazil 2014 World Cup Squad
Brazilian Football Players
Brazilian Footballers
Champions League Nationalities
Champions League Top Scorers 2010s
Champions League: The Nearly Teams
Chilean Soccer Players
Cities with Two Champions League Finalists
Clubs of La Liga
Clubs of Serie A
Clubs of the Fußball-Bundesliga
Clubs with 5+ Players at 2014 FIFA World Cup
Coached 50+ Champions' League Games
Colombian Soccer Players
Common Beginnings: English League FC
Common Ending Premier League Teams
Country by Soccer Club (A-Z)
Country by Soccer Player
Country by Soccer Player II
Country by Soccer Player III
Country by Soccer Teams
Criteria Countries: 2014 FIFA World Cup Edition
Croatian Soccer Players
Czech Soccer Players
Danish Soccer Players
David Beckham's Career
Diego Maradona's Clubs
Double Letter Premier League Players (A-Z)
Double Letter Premier League Teams
Dutch Soccer Players
England National Team Players (A-Z)
England Opponents, 2000s-2010s
England World Cup 1966
England's 1990 WC Squad
England's 2014 World Cup Squad
England's 2018 World Cup Squad
English Football Champion Cities
English Football Champions
English Football Clubs
English Football League Nicknames
English Football League Team Suffixes
English Football Players
English Premier League Champions
English Premier League: True or False
English Teams Without ENGLAND
EPL Clubs, Managers, Captains & Top Scorers (2014-15)
EPL Relegated & Promoted per Year
EPL Winning Teams, Managers, Captains & Top Scorers
Euro 2012 English Squad
Euro 2020 Teams
Euro Big Five Top Scorers (Various Years)
Europa League Winners
Europa League Winning Cities
European Cup Winners
European Football: Top Division Winners
European Soccer Leagues Champions of 2000s
European Soccer Team 'Q'
European Soccer Team 'U'
European Soccer Teams 'A' (Through 'Z')
Every 1990s Premier League Manager
FA Cup or League Cup?
FA Cup Winners
FA Cup Winning Captains
FA Cup Winning XIs
Fallen English Football Giants
FIFA 100
FIFA Ballon d'Or Winners
FIFA Confederations Cup Participants
FIFA Countries Ranked #1
FIFA Player of the Year Top Ten, 2000s & 2010s
FIFA Women's World Cup Teams
FIFA World Cup - Group Winners (98-22)
FIFA World Cup - Last Place in Each Group (98-22)
FIFA World Cup Golden Ball Winners
FIFA World Cup Golden Boot Winners
FIFA World Cup Host Countries
FIFA World Cup Quarter-Finalists
FIFA World Cup Teams
FIFA World Cup Winners in Order
FIFA World Cup: Defending Champion Losses
FIFA World Rankings Since 1993
Find the English Football Hall of Fame Inductees
Find the FIFA World Cup Winners
Find the Premier League Teams
Finish the Premier League Team
First Letters of Premier League Clubs
Football in London
Football League Clubs
Football League Cup Winners
Football League Legends
Football Leagues
Football Terms by Other Definition
Footballers Born in 1976
Footballers' Nations (A-Z)
Founding Members of FIFA
Four Players, 1 Common Club (EPL)
France's 1998 World Cup Winning Squad
Franz Beckenbauer's Career
French Soccer Players
German Soccer Players
Germany vs. Argentina: World Cup 2014 Final
Germany's 2014 World Cup Squad
Great EPL Goalscorers
Have I Won the Premier League?
Have I Won the Premier League? II
Highest Transfer Fees
I Didn't Play For Them (Champions League)
I Didn't Play For Them (Premier League)
I Didn't Play For Them (Premier League) II
I Scored at 3 World Cups
IFFHS Best Goalkeeper Rankings ('00s & '10s)
International Football Cup Winners
International Football XIs: (Various Nations)
International Footballers: (Various Nationalities)
Irish Soccer Players
Is It Offside?
Italian Soccer Players
Javier Mascherano's Clubs
Last 10 European Soccer Champions
Last Six Unique European Football Champions
Last Ten: FIFA World Cup Winners in Order
Lionel Messi and Friends
Manchester City Players by Missing Letters
Manchester United Footballers Named David
Men's & Women's World Cup
Michael Owen's Career
Most Expensive Footballer by Nation
Most Goals Scored for EPL-Winning Teams
Most Premier League Appearances in the 2010s
Most Premier League Assists (2018)
Most Premier League Goals (2018)
Most Premier League Goals and Assists by Season
Most Premier League Goals in a Calendar Year
Most Premier League Losses
Most Premier League Points Ever
Most Posh UK Football Clubs
Most Successful World Cup Team A-Z
Multiple 4-Goal+ Scorers (Premier League)
Multiple Word English Football Teams by Any Word
Multiple World Cup Hosts
Multiple World Cup Winners
Mystery Phrase Blitz: Premier League Teams
Neither Messi nor Ronaldo
Never a Fixture: Champions League
Never Played in the Premier League
Newcastle Utd's Top Scorers (Premier League)
Non-U.N. FIFA Members
Norwegian Soccer Players
Notable Players at World Cup 2022
Obscure Knowledge - All-Time Premier League Clubs
Obscure Knowledge - Champions League Winners
Obscure Knowledge - English Football Champions
Odd One Out: European Footballers' Clubs
One Team Premier League Goalscorers
One Word EPL Teams
Only One: Premier League
Order the Premier League Winners
Pelé World Cup Goals
Pelé's Career
Pick 3 Soccer Players
Played AND Managed in a World Cup Final? (Implied)
Players Who Came Back (Includes Soccer)
Polish Soccer Players
Portuguese Soccer Players
Premier League 10+ Seasons
Premier League 100 Goals
Premier League 50+ Appearances: Manchester United
Premier League All-Time Goalkeepers by Club
Premier League Appearances (Arsenal)
Premier League Arsenal's Top Scorers
Premier League Aston Villa's Top Scorers
Premier League Captains
Premier League Champions by Year
Premier League Chelsea's Top Scorers
Premier League Clubs
Premier League Clubs - Never Qualified for Europe
Premier League Clubs All-Time
Premier League Clubs' Last 5 Managers
Premier League Clubs' Top Scorer by Season
Premier League Everton's Top Scorers
Premier League Every Goal Scorer (Arsenal)
Premier League Every Goal Scorer (Liverpool)
Premier League Fives
Premier League Goal Scorers
Premier League Goalkeepers
Premier League Goalscorers by Surname Length
Premier League Golden Boot
Premier League Golden Boot Runners Up
Premier League Grounds
Premier League Legends by Transfer History
Premier League Liverpool's Top Scorers
Premier League Man United's Top Scorers
Premier League Managers
Premier League Managers (2000-2020)
Premier League Manchester City Top Scorers
Premier League Most Appearances (Career)
Premier League Nationalities
Premier League Nationalities: Europe
Premier League Newcastle Utd's Top Scorers
Premier League Nicknames
Premier League Oldest Goalscorers
Premier League or Major League Baseball
Premier League or National Football League
Premier League Peters
Premier League PFA Players OTY
Premier League Players by Debut Team
Premier League Players in 2018 World Cup
Premier League Players in Green
Premier League Players: Ten Seasons Apart
Premier League Relegated Clubs
Premier League Scorers by Continent
Premier League Stadium Match
Premier League Stalwarts
Premier League Stevens
Premier League Team Goal Stats
Premier League Team Trios
Premier League Teams 7+ Goals
Premier League Teams Never Relegated
Premier League Teams Templates
Premier League Teams that Start With a Vowel
Premier League Teams with 'B'
Premier League Teams with 'F'
Premier League Teams’ First Title Years
Premier League Top 40 Scorers Typing Challenge
Premier League Top Goalscorers by Club
Premier League Top Scorers (2019-20)
Premier League Top Scorers (2020-21)
Premier League Tottenham's Top Scorers
Premier League West Ham United's Top Scorers
Premier League Winners (Redux)
Premier League Winners' First XI
Premier League Winning Nations
Premier League XIs (2010-11)
Premier League XIs (2012-13)
Premier League: 100 Best Players
Premier League: Consistent Goal-Scorers
Premier League: Free Fallin'
Premier League: Middle of the Road Teams
Premier League: Most Expensive XIs
Premier League: Most Goals in a Season
Premier League: Top at Christmas
Premier League: Top Scorers by Nation
Premier Premier League Teams
Premiership Goal Scorers (A-Z)
Promotions into the Premier League
Re-Promoted Premier League Clubs
Score a Goal at the World Cup
Scottish Premiership Clubs
Scottish Soccer Players
Serbian Soccer Players
Sir Alex Ferguson's Man United Home Losses
Smallest FIFA World Cup Countries
Soccer Clubs with Most Titles by Country
Soccer Clubs: Is That My Country?
Soccer History in Order: 1990s
Soccer Player B-L-I-T-Z
Soccer Players as Kids
Soccer Players by First Names
Soccer Players Crossing the Atlantic
Soccer Players in 15 Seconds
Soccer Players in Commercials
Soccer Players Rainbow
Soccer Players Through the Decades
Soccer Puns
Soccer Team Crests
Soccer Traitors
Soccer: English Top 5 by Decade
Soccer: I Love You, Man
Soccer: Up-And-Down English Teams
Sound Smart About: The Premier League
South American Premier League Managers
Spain vs. Italy (Soccer)
Spanish La Liga Winners
Spanish Soccer Players
Sporcle's Easiest Premier Team (Per Letter)
Sporcle's Easiest World Cup Teams (per Letter)
Subcategory Sort: Auto Racing, Rugby, or Soccer
Successful World Cup Team by Letter (Implied)
Swedish Soccer Players
Team in Common (Includes Soccer)
Team in Common II
Ten Goals For England?
The Guardian's 100 Best Male Footballers - 2020
The Only One: Premier League
Themed Football Logos: Football
Thierry Henry's Clubs
Top 10 UEFA Nations by FIFA Rankings (2000-2019)
Top 100 UEFA Clubs
Top 20 Bundesliga Scorers (Career)
Top 3 in England (Football)
Top 4 World Cup Finish Without Ever Winning
Top Active Premier League Goalscorers
Top Premier League Scorers (2010s)
Top Premier League Scorers by Club (2015-16)
Top Premier League Scorers from Outside of Europe
Top Premier League Scorers, '00s-'10s
Top Scoring All-Time World Cup Teams
Top Six in Premier League
UEFA Champions League Final Host Cities
UEFA Champions League Finalists
UEFA Champions League Semifinalists (1994-)
UEFA Champions League Winners
UEFA Champions League Winners in Order
UEFA Champions League Winners' Starting XI
UEFA Cup Winner's Cup
UEFA Defender of the Year
UEFA Euro 2012 Draw
UEFA Euro 2020 Venues
UEFA Euro Champs
UEFA European Championship Runners-Up
UEFA Forward of the Year
UEFA Goalkeeper of the Year
UEFA Golden Players
UEFA Midfielder of the Year
UEFA Nations Logos
UEFA Teams of the Last 15 Years
UEFA Women's Champions' League
Victorious vs Premier League Champions
We Didn't Make The World Cup!
Welsh Soccer Players
What's My Country - Soccer Players
Who Won Trophies Between Man City's?
Women's World Cup Final Four
Women's World Cup Hosts
Women's World Cup Runners-Up
Women's World Cup Winners
World Cup 2010 Geography
World Cup 2014 Geography
World Cup 2018 Players (A-Z)
World Cup 2018 Referee Countries
World Cup 2022 Teams by Group
World Cup by Appearances XIs (Since 2000)
World Cup Face-Off: Who Went Further?
World Cup Final Four
World Cup Final Teams
World Cup Goal Scorers
World Cup Host Country by Mascot
World Cup Hosts
World Cup Hosts by Continent
World Cup Hosts by Year
World Cup Round of 16 Teams
World Cup Runners-Up
World Cup Third Place Playoff Winners
World Cup Winners
World Cup Winners (Redux)
World Cup Winners by Year Range
World Cup: Upsetting the Hosts
World Soccer Teams 'A'
World's Richest Football Clubs
Xavi's Career
Youngest EPL Players with 50 Goals
Basketball

1,000 Rebound NBA Seasons
10 Easy NBA Teams in 15
10 Youngest NBA MVPs
15 from 20: Basketball Players
15 in 15: NBA Eastern Teams
15 in 15: NBA Western Teams
1986 NBA Champions - Boston Celtics
1990s NBA Champions in Order
1992 Team USA (Basketball)
1996 NBA Champions - Chicago Bulls
2-Time NBA MVP Winners
20 First Names: NBA Players
2000 NBA Champions - Los Angeles Lakers
2001/02 NBA Top Ten Scorers
2008 Team USA (Basketball)
2010s Golden State Warriors Statistical Leaders
2010s NBA All-Stars
2010s Top Scorers: (Various NBA Teams)
2012 Team USA (Basketball)
2016-17 NBA Playoffs: Fact Checker
2016-17 NBA Season Leaders
2016-17 NBA Statistical Leaders by Team
2017 NBA All-Stars
2021 NBA Play-In Tournament Teams
2022 NBA All-Star Game - Team LeBron
2022 NBA Playoff Bracket
2023 NBA In-Season Tournament Final Eight
2023 NBA Playoff Bracket
2023/24 NBA Top Ten Scorers
2024 NBA All-Star Game Players
2025 NBA All-Stars
3 NBA Championships in 10 Years
30 in 60: NBA Teams
30-Points in NBA Finals Decider
4-Letter NBA Teams
5 Answers to 1: NBA
5,000 Points for Two NBA Teams
5-Letter NBA Teams
50 Greatest Players in NBA History
50 Point NBA Finals
50 Points in a Game - Boston Celtics
50 Points in a Game - Los Angeles Lakers
50 Points in a Game - Philadelphia 76ers
50 Winningest NBA Players
5x2 Blitz: Basketball
5x2 Blitz: NBA
A Cup of NBA Latte
Acrostic Jerry West
All-NBA Team Players (1990s)
All-NBA Team Players (2000s)
All-NBA Teammates of the 2000s
Alphabetized Anagrams: NBA Teams
An Introduction to Basketball
Anagrammed NBA Duos
Any 10,000 Point Scorer by NBA Team
Any NBA Finals MVP per Team
Anyone but Julius Erving
Anyone but Kobe Bryant
Anyone but Larry Bird
Anyone but LeBron James
Anyone but Magic Johnson
Anyone but Michael Jordan
Anything but the NBA
AP All-Americans (Includes Basketball)
AP Basketball #1 Schools
Atlanta Hawks All-Time Leaders
Atlanta Hawks MVP Votes
Backward NBA Team Match-Up
Basketball at the Olympics
Basketball Hall of Fame
Basketball Hall of Famer by Letter
Basketball Hall of Famers by Draft Year
Basketball Players by First Names
Bill Simmons' Basketball Pyramid
Bizarre NBA Statlines
Boston Celtics All-Time Leaders
Boston Celtics MVP Votes
Boston Celtics Players
Brooklyn Nets All-Time Leaders
Brooklyn Nets MVP Votes
Bullseye Blitz: NBA!
Celtics' Retired Numbers
Charlotte Hornets All-Time Leaders
Charlotte Hornets MVP Votes
Chicago Bulls All-Time Leaders
Chicago Bulls MVP Votes
Christmas Day NBA Leaders
Christmas Day Triple Doubles
Cleveland Cavaliers All-Time Leaders
Cleveland Cavaliers MVP Votes
Click the 1984 NBA Draft
Click the 1987 NBA Draft
Click the 1993 NBA Draft
Click the 1996 NBA Draft
Click the 1998 NBA Draft
Click the 1999 NBA Draft
Click the 2000 NBA Draft
Click the 2003 NBA Draft
Click the 2009 NBA Draft
Click the 2010 NBA Draft
Click the 2011 NBA Draft
Click the 2014 NBA Draft
Click the 2022 NBA Draft
Clickable NBA Alma Maters
Closest NBA Teams to Canada
Closest NBA Teams to Chicago Bulls
Closest NBA Teams to Mexico
Clueless Letter Lines: NBA Teams
Coach K Biography
Colleges of NBA First Overall Picks
Colleges with 3 Consecutive First Round NBA Draft Picks
Cover the Alphabet - NBA Teams
Curry, James, or Both?
Dallas Mavericks All-Time Leaders
Dallas Mavericks MVP Votes
David Stern Meeting Draft Picks
Denver Nuggets All-Time Leaders
Denver Nuggets MVP Votes
Detroit Pistons All-Time Leaders
Detroit Pistons MVP Votes
Different First and Last Letter: NBA Teams
Dikembe Mutombo's NBA Teams
Dirk Nowitzki's Top Scoring Teammates per Season
Dr. Naismith's Original Rules of Basketball
Either/Or in 30: NBA Teams
ESPN's 100 Greatest NBA Players of All-Time
Every Leading Scorer in the 2015 NBA Playoffs
Find the Basketball Hall of Fame Inductees (Various Decades)
Find the NBA Teams
Find the Vowel-less NBA Teams
First Five: NBA Champions? (Implied)
First NBA 50 Point Game by Season
First NBA MVP by Team
Golden State Warriors All-Time Leaders
Golden State Warriors MVP Votes
Greatest NBA Playoff Scoring Debuts
Head to Head: NBA
Highest NBA Playoff PPG per Season
Highest Scoring NBA Trios (2000s)
Houston Rockets All-Time Leaders
Houston Rockets MVP Votes
Increasing Options: NBA
Indiana Pacers All-Time Leaders
Indiana Pacers MVP Votes
Invisible NBA Teams
Isogram Blitz: NBA Teams
John R. Wooden Award Winners (Men's)
Kobe Bryant's Top Scoring Teammates per Season
Kobe Hugs
Lakers Retired Numbers
Last 10 NBA All-Stars Per Team
Last 60 All-NBA First Teams
Last All-NBA Player Per Team
Last Five: NBA Champions? (Implied)
Last Ten NBA Champions
Leading Scorers of NBA Champions
LeBron James Teams Venn Diagram
LeBron James' Career Achievements
LeBron James' Top Scoring Teammates per Season
Letter Grid: NBA Teams
Letters Minefield: NBA Teams
Los Angeles Clippers All-Time Leaders
Los Angeles Clippers MVP Votes
Los Angeles Lakers All-Time Leaders
Los Angeles Lakers Highest-Scoring Game Each Year
Los Angeles Lakers MVP Votes
Memphis Grizzlies All-Time Leaders
Memphis Grizzlies MVP Votes
Miami Heat All-Time Leaders
Miami Heat MVP Votes
Miami Heat Players
Michigan Basketball's Fab Five
Milwaukee Bucks All-Time Leaders
Milwaukee Bucks MVP Votes
Minnesota Timberwolves All-Time Leaders
Minnesota Timberwolves MVP Votes
Missing Vowel Minefield: NBA Western Conference (Format borderline)
Most 1000 Point NBA Seasons (1990s)
Most Career Playoff Points (NBA)
Most Dunks (NBA)
Most Dunks, '00s & '10s (NBA)
Most NBA Playoff Points per Decade
Most NBA Single Game Points per Season
Most Points in an NBA Playoff Game
Most Points in an NBA Playoff Series
Most Points Scored in an NBA Game
Most Starts at Center By Team (NBA)
Most Starts at Guard by Team (NBA)
Most to Fewest NBA Championships Minefield (Format borderline)
Most Triple Doubles in a Season (NBA)
Most Triple-Doubles in NBA History
Most Triple-Doubles in NBA Playoffs
Multi-Category Minefield Blitz: NBA (Format borderline)
Multiple Choice: NBA MVPs
Naismith Award Winners
Name 10 in 30: NBA Players
Name That Basketball Conference
NBA #1 Draft Picks (Various)
NBA 'Short' Points Leaders
NBA - A Block! A Steal! A Three!
NBA - Most All-Star Selections by Decade
NBA 10+ Rebounds Per Game (2000s)
NBA 10,000 Points & 5,000 Assists (Single Franchise)
NBA 1000 Career Blocks & Steals
NBA 15+ Points Trios (2000s)
NBA 15+ Points Trios (2010s)
NBA 15-15-15 Triple Doubles
NBA 1500+ Point Seasons (2000s)
NBA 1500+ Point Seasons (2010s)
NBA 15K Points, One Franchise
NBA 1st Rounders' Colleges
NBA 2 Teammates, 35 Pts, 1 Game (2000s)
NBA 20 PPG Seasons in the 1990s
NBA 20+ PPG Rookies
NBA 2000+ Playoff Points
NBA 20K Point/10K Rebound Club
NBA 20K Points & 1st Team All-NBA
NBA 21 and Under All-Stars
NBA 25 PPG After 10 Seasons
NBA 25+ PPG (2000s)
NBA 2nd Overall Draft Picks
NBA 3-1 Comebacks
NBA 3-Point Leaders (2010s)
NBA 3-Point Leaders (Career)
NBA 3-Point Leaders by Team (2010s)
NBA 30 PPG Seasons
NBA 30+ Point Games by Team (2000s)
NBA 30+ Point Season Openers, '00s-'10s
NBA 30,000 Point Club
NBA 30,000 Point Club Alphabetically
NBA 35+ Point Games (2010s)
NBA 3PA vs 2PA (2015-16)
NBA 40 Point Games (2000s & 2010s)
NBA 40 Points in a Finals Game
NBA 40 Points in Playoff Loss, '80s-'10s
NBA 5-Year Scoring - (Various Teams)
NBA 50 Greatest Players - First Names
NBA 50 Greatest Players Alma Maters
NBA 50 Point Games (1990s)
NBA 50 Point Games (2000s)
NBA 50 Point Games (2010s)
NBA 6th Man Award
NBA 70+ Point Games
NBA All-Defensive Teams
NBA All-Star Appearances
NBA All-Star Game 20-Point Scorers
NBA All-Star Game MVPs
NBA All-Star or No-Star
NBA All-Star Vote Leaders
NBA All-Star: 3-Point Champs
NBA All-Stars (2000s)
NBA All-Stars Back-to-Back on Two Teams
NBA All-Stars by Current Team
NBA All-Stars on Championship Teams (2010s)
NBA All-Stars Who Weren't 1st Round Picks
NBA Alma Maters
NBA Alma Maters: Duke, UNC, or UConn?
NBA and NCAA, Same Team Names
NBA Arenas
NBA Assists Leaders (2010s)
NBA Award and Title in Same Year
NBA Best Lineups (2012-13)
NBA Best Lineups (2015-16)
NBA Best Overall Lineups Since 2000-01
NBA Best Selling Jerseys by Team (2011)
NBA Bill Simmons Top 10 Trade Value
NBA Career Assist Leaders
NBA Career Block Leaders
NBA Career MVP Shares
NBA Career Ranking Showdown
NBA Career Rebound Leaders
NBA Career Scoring Leaders
NBA Career Steals Leaders
NBA Champion Starters (2000s)
NBA Champions
NBA Championship Coaches
NBA Championship Starting Lineups
NBA Championship Team Stat Leaders - '80s-'10s
NBA Championships With Multiple Teams
NBA Champs Big Three
NBA Christmas Day Scoring Leaders
NBA Closest Team
NBA Coach of the Year
NBA Coaches
NBA Coaching Wins
NBA Colleges
NBA Conference Finals Teams (2010s)
NBA Defensive POY
NBA Double-Double Averages (2000-2010)
NBA Double-Double Rookies
NBA Draft Busts
NBA Draft Class Top Scorers
NBA Draft Lottery Picks
NBA Dual MVP Winners
NBA Eastern Scoring Leaders (2000s)
NBA Every 25 PPG Scorer In History
NBA Finals Career Leaders
NBA Finals Coaches
NBA Finals Game Top Scorers (1990s)
NBA Finals Game Top Scorers (2000s)
NBA Finals Game Top Scorers (2010s)
NBA Finals MVP - First Names
NBA Finals MVP and NCAA Champion
NBA Finals MVPs
NBA Finals MVPs for Multiple Franchises
NBA Finals Scoring Leaders
NBA Finals: Rematches
NBA Five 10+ Point Teammates (2000s)
NBA Franchise 3-Point Leaders
NBA Franchise All-Time Leaders
NBA Franchises with 5 NBA Championships
NBA Franchises, East to West
NBA Free Throw Leaders (Career)
NBA Game Highs by Team (2010-11)
NBA Golden MVPs
NBA Greats by Age
NBA Hall of Famers Active in 2010
NBA Highest Scoring Rookie By Team
NBA HS 1st Rounders
NBA Last 50-Point Game (by Team)
NBA Last Five 25.0+ PPG Players by Team
NBA Last Top 5 Draft Pick (per Team)
NBA Legends: Career Rebounds Trajectories
NBA Lottery Winning Teams
NBA Mascot Blitz
NBA Most 1,000 pt. Players by College
NBA Most Career Playoff Points
NBA Most Dunks 2015-16
NBA Most Dunks, '00s & '10s
NBA Most Playoff Blocks (1990s)
NBA Most Points by Decade
NBA Most Points in a Single Playoffs
NBA Most Points w/o 20ppg Season
NBA Most Starts at Center By Team (2000s)
NBA Most Starts at Guard by Team (2000s)
NBA Most Top 5 Finishes (Points)
NBA Multiple-Team States
NBA MVP & Olympic Gold
NBA MVP Player Letter Blitz
NBA MVP Runners-Up
NBA MVP Teammates
NBA MVP Top-10 Teammates (Since 1970)
NBA MVP Voting (2000s)
NBA MVP Voting (2010)
NBA MVP Voting (2010s)
NBA MVP Voting (2011-12)
NBA MVPs
NBA MVPs (Regular Season & Finals)
NBA MVPs Who Didn't Go to College
NBA MVPs Who Won a National Championship
NBA MVPs with No Championships
NBA Old-Timers (10+ PPG)
NBA One Team Hall of Famers
NBA One Team Players
NBA Opening Day Alma Maters (2010)
NBA Opening Night (2013-14)
NBA Opening Night Starters: Chicago Bulls
NBA Opening Night Starting Lineups (2014-15)
NBA Over/Under 20 PPG
NBA Overall #1 Draft Picks
NBA Per Game Leaders by Team (2013-2014)
NBA Player by Resume
NBA Player by Resume II
NBA Players Born in Asia
NBA Players Joined by Name
NBA Players Locked Out Twice
NBA Players Rainbow
NBA Players Rainbow II
NBA Players with 20+ PPG Seasons (2010s)
NBA Players with 50 Point Games
NBA Players with 60 Point Games
NBA Players with Initial Nicknames
NBA Players with Most Championships
NBA Players with Multiple MVPs
NBA Players’ First Championships
NBA Playoffs Since 1980
NBA Playoffs Single Season Top 10s
NBA Playoffs Statistical Leaders
NBA Playoffs Top 10 (1990s)
NBA Playoffs Top 10 (2000s)
NBA Points Leaders by Team
NBA Points Leaders by Team (1990s)
NBA PPG Leaders (Season)
NBA Rebounding Machines (1986-2016)
NBA Rookie Stat Leaders (1990s)
NBA Rookie Stat Leaders (2000s)
NBA Rookies of the Year
NBA Same Last Name Trios
NBA Same Last Name Trios II
NBA Scoring by Letter
NBA Scoring Champs Since 1986
NBA Scoring Leaders (2010s)
NBA Shaq's Starting Lineups
NBA Single Game Franchise Records
NBA Single Game Scoring by Team
NBA Single Season Bests By Team (2000s)
NBA Single Season Top 10s
NBA Single Team Hall of Famers
NBA Starters By Team (1980s)
NBA Starters By Team (2000s)
NBA States & Provinces
NBA Team by Championship Years
NBA Team by Phonetic Name
NBA Team by Three Coaches
NBA Team Coaching Wins
NBA Team Last All-Star
NBA Team Leaders (2000s)
NBA Team Leaders (2010s)
NBA Team Pairs
NBA Team Point Leaders
NBA Team Trios
NBA Teams
NBA Teams (Redux)
NBA Teams - Fit the Pattern
NBA Teams by Division Blitz
NBA Teams by Finals Loss
NBA Teams by First 3 Letters
NBA Teams by Last 3 Letters
NBA Teams by Mascot
NBA Teams by Name Length
NBA Teams by State
NBA Teams by Time Zone
NBA Teams per Length
NBA Teams Point Leaders (2000s)
NBA Teams with 'Z'
NBA Teams with 4 All-Stars
NBA Teams Without 'NBA'
NBA Teams Without MVPs
NBA Teams' Last MVP
NBA Teams' Last Rookie of the Year
NBA Three Decade All-Stars
NBA Three-peat Players
NBA Top 10 (1980s)
NBA Top 10 (1990s)
NBA Top 10 (2000s)
NBA Top 10 MVP Voting, '00s-'10s
NBA Top 10 Points in the Paint
NBA Top 10 Scorers per Season (1970s)
NBA Top 10 Scorers Per Season (1980s)
NBA Top 100 Per Game Scorers
NBA Top 100 Scorers (2010s)
NBA Top 100 Scoring Seasons, '00s-'10s
NBA Top 10s (2010s)
NBA Top 20 PPG (2000s)
NBA Top 200 Scorers (1980s)
NBA Top 200 Scorers (1990s)
NBA Top 200 Scorers (2000s)
NBA Top 200 Scorers (2012-13)
NBA Top 200 Scorers (2015-16)
NBA Top 200 Scorers (2016-17)
NBA Top 200 Scorers 2000s & 2010s
NBA Top 25 by Category
NBA Top 25 Foreign-Born Scorers
NBA Top 3 MVP Voting By Year
NBA Top 5 Career Scorers Per Draft, '90s-'10s
NBA Top 5 Draft Picks (2000s)
NBA Top 5 Playoff Scorers By 5-Year Period
NBA Top 5 PPG Seasons By Franchise
NBA Top 5 Scorers By 5-Year Period
NBA Top 5 Scorers by College, '00s & '10s
NBA Top 50 Most Productive Games
NBA Top Four Starting Lineups (2010s)
NBA Top Playoff Scorers by Team (2010s)
NBA Top Rebounders of the 2010s
NBA Top Scorer by Age
NBA Top Scorers by Decade
NBA Top Scorers by Franchise
NBA Top Scorers Forced Retirement (2000s)
NBA Top Scorers Who Didn't Make the Playoffs
NBA Top Scoring Duos By Year
NBA Top Scoring Lefty by Season
NBA Top Scoring Trios by Year
NBA Top Single Playoff Scoring Trios
NBA Triple-Doubles (2010s)
NBA Turnovers
NBA West All-Stars (2000s)
NBA Western Scoring Leaders (2000s)
NBA Yearly Leaders: 3PM, 3PA, 3P%
NBA Yearly Minutes per Game Leaders
NBA's 75th Anniversary List
NBA's Sweet 16
NBA: 10,000 Points Before 1st All-Star Appearance
NBA: 1000+ Playoff Points, 2 Decades
NBA: 150 Playoff Assists
NBA: 2,000 Point Seasons for 2 Teams
NBA: 35+ Points on Christmas Day
NBA: 40 Points, 3+ Teams
NBA: 5 Rings, Different Teams
NBA: 7,000 Points Past 30
NBA: Almost Back-to-Back Championship Wins
NBA: Brothers or Not
NBA: Finals 3-Point Leaders
NBA: Literally
NBA: Most Efficient 50+ Point Games
NBA: Multiple 50-Point Games
NBA: Western or Eastern Conference?
New Orleans Pelicans All-Time Leaders
New Orleans Pelicans MVP Votes
New York Knicks All-Time Leaders
New York Knicks MVP Votes
North America by Nearest NBA Team (Format borderline)
Obscure Knowledge - NBA Teams
Oklahoma City Thunder All-Time Leaders
Oklahoma City Thunder MVP Votes
One Wrong Answer: NBA MVPs
Opening Game Starting 5: LA Lakers
Order the All-Time NBA Leading Scorers
Orlando Magic All-Time Leaders
Orlando Magic MVP Votes
Overlapping NBA Names
Past NBA Logos (Format borderline)
Pat Summitt Championship Wins
Philadelphia 76ers All-Time Leaders
Philadelphia 76ers MVP Votes
Phoenix Suns All-Time Leaders
Phoenix Suns MVP Votes
Pick 3 Basketball Teams
Pick 5 in 15: NBA Teams
Pick the Correct NBA Team
Pick the NBA Teams Alphabetically
Playoff Opponents of Kobe Bryant
Playoff Opponents of LeBron James
Portland Trail Blazers All-Time Leaders
Portland Trail Blazers MVP Votes
Profile: Bill Russell
Rookie Rivals: NBA
Sacramento Kings All-Time Leaders
Sacramento Kings MVP Votes
Same Letter NBA Teams
Shaq's NBA All-Star Teammates
Shaq's Top Scoring Teammates per Season
Shaquille O'Neal Missing Teammates
Shared Location NBA & WNBA
Six Sixes in Sixty: NBA
Slam Dunk Champs
Spectacular NBA Players
Split Decision: Basketball Players
Split Decision: NBA Teams
Sporcle Jumble: NBA Teams
Sporcle's Easiest NBA (per Letter)
State by NBA Team (Format borderline)
Subcategory Sort: MLB, NBA, NFL, or NHL
Teams of Larry Brown
Teams with More Playoff Games than LeBron James
Ten Group Blitz: NBA
The NBA's Most Memorable Numbers
The Only One: NBA
Three-Time NBA MVPs
Tic-Tac-Trivia: NBA
Tim Duncan's Top Scoring Teammates per Season
Top 10 Centers (ESPN)
Top 10 NBA Salaries (1990-2020)
Top 10 Point Guards (ESPN)
Top 10 Power Forwards (ESPN)
Top 10 Small Forwards (ESPN)
Top 100 Scorers in NBA History
Top 5 NBA Playoff Scorers, '90s-'10s
Top NBA Finals Points Scorers
Top NBA Rookie Scorers, '00s-'10s
Top Rebounder by NBA Championship Team
Tournament of Basketball Players
Trivia Jigsaw: NBA
Two-Word NCAA Men's Basketball Team Names
Ultimate NBA 2000s (Single Game Edition)
Unique Letter NBA Teams
Unique Letters: NBA Teams
Upset Basketball Players
US Olympic Basketball
US Olympic Basketball Leaders
Utah Jazz All-Time Leaders
Utah Jazz MVP Votes
Vanishing NBA Teams Blitz
Vowel-Swapped NBA Teams
Was He a Celtic?
Was He a Laker?
Was I on the Team: Boston Celtics
Was I on the Team: Los Angeles Lakers
Washington Wizards All-Time Leaders
Washington Wizards MVP Votes
Westbrook and Harden Teams
What's in the Box: Dream Team
Where Did I Win First? NBA
Which Boston Sports Team? (Includes Celtics)
Which Is the WNBA Team?
Which NBA Player Is It?
Which NBA Player?
Which Philadelphia Sports Team? (Includes 76ers)
Which Teams Did He Play For? (NBA)
Who Beat the Warriors?
Who DIDN'T They Beat in the NBA Finals?
Winningest Men's College Basketball Programs
Within 10,000 Points of LeBron James
WNBA Champions
WNBA Most Career Points
WNBA MVPs
WNBA Teams
Zero to Five Blitz: NBA Teams
Tennis

#1 Ranked Tennis Players
20+ Grand Slam Singles Titles
Acrostic Wimbledon Winners
Almost Career Men's Tennis Grand Slam
Almost Career Women's Tennis Grand Slam
An Introduction to Tennis
Australian Open Champs
Australian Open Champs (A-Z)
Australian Open Men's Seeds 2003-2020
Australian Open Singles Champions by Year (2010s)
Billie Jean King, This Is Your Life
Career Slam (Includes Tennis)
Facts About Federer!
Federer Final Losers
Find the Tennis Hall of Fame Inductees (Men's)
Find the Tennis Hall of Fame Inductees (Women's)
French Open Champs (A-Z)
French Open Men's Seeds 2003-2020
French Open Winners
French Open Women's Seeds 2003-2020
Grand Slam Tennis Champions (A‒Z)
Grand Slam Tennis Tournaments
Last Five: Tennis Grand Slam Winners
Letter Grid Blitz: Tennis Grand Slam Champions
Men's Grand Slam #1 Seeds
Men's Tennis at the Summer Olympics
Men's Tennis Grand Slam
Men's Tennis Grand Slam Semi-Finalists
Men's Tennis Top 50 (2010)
Men's Tennis Year-End Top 4
Most Grand Slam Matches Won Without Title
Nationalities at Wimbledon (2010)
Not Nadal or Đoković (2010s)
Serena Williams Grand Slam Championship Opponents
Steffi Graf is married to which Tennis Player? (Implied)
Tennis #1 or Not
Tennis 4+ Wins In Major Tournaments (Men)
Tennis Grand Slam Winners
Tennis Grand Slam Winners (1990s)
Tennis Grand Slam Winners (2000s)
Tennis Grand Slam Winners by Decade
Tennis Grand Slam Winners by Year (Men's)
Tennis Players
Tennis Players A-Z
Tennis Players by First Names
Tennis Players Rainbow
Tennis Year-End #1s
Those 12 Flags: Tennis Players
US Men's 'US Open' Tennis Performances
US Open Runner-Up (Men)
US Open Runner-Up (Women)
US Open Tennis Champs
US Open Tennis Champs (A-Z)
US Open Top Finishers, '00s & '10s
Venus or Serena?
What's My Country - Tennis Players
Who Beat Rafael Nadal?
Which Tennis Player?
Wimbledon Runners Up (Men)
Wimbledon Runners-Up (Ladies)
Wimbledon Singles Champions by Decade
Wimbledon Singles Winners (A-Z)
Wimbledon Winners
Women Tennis Players by Weeks at #1 Ranking
Women's Tennis Grand Slam
Women's Tennis Grand Slam #1 Seeds
Women's Tennis Top 50 (2010)
You Make The Rules: Tennis
Olympics

'S' Olympic Host Cities
10 to 1: The Olympics
2008 Olympic Sports
2010 Olympic Nations
2010 Winter Olympic Medal Countries
2010 Winter Olympic Sports
2012 Olympic Nations
2014 NHL Olympians by Team
2016 Summer Olympics Medal Winning Countries
2016 Summer Olympics Sports
2022 Winter Olympics Countries
2022 Winter Paralympics Countries
4-to-1 Blitz: Olympics
Absent Letter Olympic Events
Absent Letter Olympic Host Cities
African Countries Winter Olympics
All Time Olympics Medal Winners
Animated Olympics
Anything but Winter Olympic Sports
Basketball at the Olympics
Best African Olympic Countries
Best Olympic Swimming Nations
Best Olympic Track and Field Nations
Conn Smythe & Olympic Gold
Countries in Every Winter Olympics
Countries Specialized in Winter Olympics
Cover the Alphabet - Olympics Host Cities
Criteria Olympic Sports
Decathlon Events
Double Letter Olympic Sports
First Olympics Host by Continent
First Ten Summer Olympic Host Cities
Flip Flop: Olympic Sports
Gimme 5: Winter Olympics Events
Golden Winter Olympics Nations
Gymnastics Events
Last Ten Olympic Host Cities
London 2012 Olympic Torch Route
London 2012 Paralympic Sports
Men's Tennis at the Summer Olympics
Modern Pentathlon
Most Olympic Medals A-Z
NBA MVP & Olympic Gold
New 2020 Olympic Sports
Obscure Knowledge - Olympic Host Cities
Olympic '...thlon' Events
Olympic and Major Winners (Includes non-Olympic sports)
Olympic Boycott Countries (1980 & 1984)
Olympic Cauldron Lighters
Olympic Cities (A-Z)
Olympic Cities by Decade Blitz
Olympic Cities First Letter Blitz
Olympic Countries No More
Olympic Country Codes (A-Z)
Olympic Fencing Weapons
Olympic Figure Skaters
Olympic Football (Soccer) Medal Winners
Olympic Host Cities by Any 3 Letters
Olympic Host Cities by Decade
Olympic Host Countries
Olympic Medal Table: Alpine Skiing
Olympic Medal Table: Figure Skating
Olympic Medal Table: Snowboarding
Olympic Medal Table: Speed Skating
Olympic Medalists By Country
Olympic Opening Ceremonies
Olympic Sports (A-Z)
Olympic Sports by Movie
Olympic Sports Equipment
Olympic Sports in Rings
Olympic Swimming Events
Olympic Track and Field Events
Olympics Host Cities Sorting Blitz (Format borderline)
Olympics Hosts: Winter or Summer?
Olympics Race - With Olympic Fanfare
Olympics Sorting Blitz (Format borderline)
One Country, One City, Multiple Olympics
Original Summer Olympic Sports
Original Winter Olympic Events
Over/Under: The Olympic Games
Pick 3 Winter Sports
Pick 5 in 15: Olympic Sports
Quiz Mountain: Olympic Edition
Seven Sports Successes: Olympics
Successful Olympian by Country
Successful Olympic Hosts
Summer Medal Countries
Summer Olympic Sports by Athlete
Summer Olympic Top 10 Blitz
Summer Olympics Gold Medal Countries
Summer Olympics Host Countries
Summer Olympics: Nations by Sport
Ten Group Blitz: Olympics
The Last: Olympics
Those 12 Flags: Olympic Flag Bearers (Men)
Those 12 Flags: Olympic Flag Bearers (Women)
Top Five Countries in the Winter Olympics
Trimmed Olympic Sports
True or False: Summer Olympics
US Olympic Basketball
US Olympic Basketball Leaders
Vowel-less Summer Olympic Sports
Winningest Olympic Champions
Winter Olympic Countries
Winter Olympic Sports Cut in Half
Winter Olympic Top 10 Blitz
Winter Olympics Gold Medal Countries
Winter Olympics Host Countries
Winter Olympics Medal Winners
Winter Sports Equipment
World Capital Olympic Hosts
`;
// !!! END OF SAMPLE LIST - REPLACE ABOVE !!!


interface InspirationTopic {
  topic: string;
  category: Category;
  is_active: boolean; // Make sure this matches your table column name
}

function parseInspirationList(text: string): InspirationTopic[] {
  const lines = text.trim().split('\n');
  const topics: InspirationTopic[] = [];
  let currentCategory: Category | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue; // Skip empty lines

    // Check for category headers (adjust matching if needed)
    if (trimmedLine.toLowerCase().startsWith('soccer (football)')) {
      currentCategory = 'football';
      continue; // Skip the header line itself
    } else if (trimmedLine.toLowerCase().startsWith('basketball')) {
      currentCategory = 'basketball';
      continue;
    } else if (trimmedLine.toLowerCase().startsWith('tennis')) {
      currentCategory = 'tennis';
      continue;
    } else if (trimmedLine.toLowerCase().startsWith('olympics')) {
      currentCategory = 'olympics';
      continue;
    }

    // If we have a category and the line isn't a header, it's a topic
    if (currentCategory) {
      topics.push({
        topic: trimmedLine,
        category: currentCategory,
        is_active: true // Default to active
      });
    } else {
        console.warn(`Skipping line - no current category assigned: "${trimmedLine}"`);
    }
  }
  return topics;
}

async function populateTopics() {
  try {
    // *** IMPORTANT: Ensure you replace sampleInspirationListText with your actual list before running! ***
    const topicsToInsert = parseInspirationList(sampleInspirationListText);

    if (topicsToInsert.length === 0) {
        console.log("No topics parsed from the list. Please check the input text and parsing logic.");
        return;
    }

    console.log(`Parsed ${topicsToInsert.length} topics to potentially insert/update.`);

    // Reduce batch size to potentially avoid fetch errors in restricted environments
    const BATCH_SIZE = 50;
    let totalAffectedEstimate = 0; // Estimate of affected rows

    for (let i = 0; i < topicsToInsert.length; i += BATCH_SIZE) {
      const batch = topicsToInsert.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(topicsToInsert.length / BATCH_SIZE);

      console.log(`Processing batch ${batchNumber} of ${totalBatches} (${batch.length} topics)`);

      // Use upsert to avoid errors if a topic already exists
      const { error } = await supabaseAdmin
        .from('inspiration_topics')
        .upsert(batch, {
          onConflict: 'topic', // Use the 'topic' column (must be UNIQUE)
          ignoreDuplicates: false
        });
        // Removed the .select() causing previous errors

      if (error) {
        // Log the specific error encountered for this batch
        console.error(`Error upserting batch ${batchNumber}:`, error);
        // Optional: Decide if you want to stop on error or continue
        // For now, we log and continue to the next batch
      } else {
        console.log(`Successfully submitted upsert for batch ${batchNumber}.`);
        totalAffectedEstimate += batch.length; // Add batch size to estimate
      }
      // Optional: Add a small delay between batches if needed
      // await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Population process completed. Processed ${topicsToInsert.length} topics. Estimated rows affected: ${totalAffectedEstimate}. Please verify in Supabase.`);

  } catch (error) {
    console.error('Critical error during populateTopics function:', error);
    process.exit(1);
  }
}

// Run the population script
populateTopics();