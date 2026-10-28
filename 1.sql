CREATE OR REPLACE FUNCTION public.getstudentgradeinfohistory_v2(p_xmlcourselist xml, p_xmlstudentlist xml, p_schoolid integer, p_isyearlyreport boolean)
 RETURNS TABLE(sid integer, sstudentid text, ngradeid integer, splaneid integer, nterm text, nterm2 text, ntsublevel integer, ntermsublevel2 integer, nyear integer, sterm1 text, sterm2 text, roomname text, coursecode text, coursename text, coursetype integer, coursegroup integer, coursetotalhour double precision, coursestatus integer, coursehour double precision, firstname text, lastname text, titledesc text, term1score text, term2score text, getscore100 text, getgradelabel text, ncredit double precision, gradexncredit double precision, getspecial text, gpa double precision, coursetypeorder integer, sortnumber integer, getscore50 text)
 LANGUAGE plpgsql
 ROWS 100000
AS $function$

BEGIN
IF (p_IsYearlyReport =false) THEN
RETURN QUERY WITH tmp_StudentGradeInfo AS
(
	SELECT * FROM GetStudentGradeInfoCommonHistory_V2(p_XMLCourseList, p_XMLStudentList, p_SchoolId)
)
,tmp_StudentGradeInfo2 AS
(SELECT
		 			distinct G."sID", G."sStudentId", G."nGradeId",G."sPlaneID",G."NTerm",'' nTerm2, G."nTSubLevel", G."nTermSubLevel2",G."nYear",
					'' sTerm1, '' sTerm2, G."RoomName",
					G."CourseCode", G."CourseName", G."CourseType",G."CourseGroup",G."CourseTotalHour",G."CourseStatus", G."CourseHour",
					G."FirstName", G."LastName", G."TitleDesc",
					'' Term1Score, '' Term2Score,   G."getScore100"::text getScore100,G."getgradelabel",
					G."ActualNCredit" nCredit,
					G."GradeXNCredit",
					G."getSpecial",
					coalesce(nullif(g."gpa"::text, '')::double precision, 0) as gpa,
					G."nOrder" courseTypeOrder,
					COALESCE(G."SortNumber", 999999) sortNumber,
 --case when (G."getScore100" is not null and G."getScore100" != '''')
					--then
					--to_char(coalesce(nullif(g."getScore100"::text, '')::double precision, 0) / 2, 'FM9999.99')
						--else '''' end getScore50
 CASE
    WHEN (G."getScore100" IS NOT NULL AND G."getScore100" != '''') THEN
        CASE
            WHEN COALESCE(NULLIF(G."getScore100"::text, '')::double precision, 0) / 2 =
                 FLOOR(COALESCE(NULLIF(G."getScore100"::text, '')::double precision, 0) / 2)
            THEN TO_CHAR(COALESCE(NULLIF(G."getScore100"::text, '')::double precision, 0) / 2, 'FM9999')
            ELSE TO_CHAR(COALESCE(NULLIF(G."getScore100"::text, '')::double precision, 0) / 2, 'FM9999.00')
        END
    ELSE ''''
END AS getScore50
				 from tmp_studentgradeinfo G
				 order by G."CourseGroup",G."nOrder", COALESCE(G."SortNumber", 999999), G."CourseCode"
)
 select * from tmp_StudentGradeInfo2;
ELSE
RETURN QUERY WITH tmp_StudentGradeInfo AS
(
	SELECT * FROM GetStudentGradeInfoCommonHistory_V2(p_XMLCourseList, p_XMLStudentList, p_SchoolId)
)
,tmp_StudentGradeInfoYearly AS (
select distinct
							COALESCE(a."sID", b."sID") sID, COALESCE(a."sStudentId", b."sStudentId") sStudentId,
		  					COALESCE(a."nGradeId", b."nGradeId") nGradeId, COALESCE(a."sPlaneID", b."sPlaneID") sPlaneID,
							a."NTerm" NTerm,b."NTerm" NTerm2,
							COALESCE(b."nTSubLevel", a."nTSubLevel") nTSubLevel, COALESCE(b."nTermSubLevel2", a."nTermSubLevel2") nTermSubLevel2,
							COALESCE(a."nYear", b."nYear") nYear,
		  COALESCE(a."sTerm",'1') sTerm, b."sTerm" sTerm2,
		  COALESCE(b."RoomName", a."RoomName") RoomName,
							COALESCE(a."CourseCode",b."CourseCode") CourseCode, COALESCE(a."CourseName", b."CourseName") CourseName, COALESCE(a."CourseType", b."CourseType") CourseType,
							COALESCE(a."CourseGroup", b."CourseGroup") CourseGroup,COALESCE(a."CourseTotalHour", b."CourseTotalHour") CourseTotalHour, COALESCE(a."CourseStatus", b."CourseStatus") CourseStatus,
							COALESCE(a."CourseHour", b."CourseHour") CourseHour,
							COALESCE(a."FirstName", b."FirstName") FirstName, COALESCE(a."LastName", b."LastName") LastName, COALESCE(a."TitleDesc", b."TitleDesc") TitleDesc,
							a."getScore100" term1Score,b."getScore100" term2Score,



	CASE
							WHEN COALESCE(a."IsScoreExist", 0) = 1 AND COALESCE(B."IsScoreExist", 0) = 1 AND (POSITION('.' IN COALESCE(a."getScore100", '0')) > 0 OR POSITION('.' IN COALESCE(b."getScore100", '0')) > 0)
								THEN TO_CHAR(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(B."getScore100", '0') AS FLOAT)) / 2), 'FM999999990.00')
							WHEN COALESCE(a."IsScoreExist", 0) = 1 AND COALESCE(B."IsScoreExist", 0) = 0 AND (POSITION('.' IN COALESCE(a."getScore100", '0')) > 0 OR POSITION('.' IN COALESCE(b."getScore100", '0')) > 0)
								THEN TO_CHAR(ROUND(CAST(COALESCE(a."getScore100", '0') AS NUMERIC), 2), 'FM999999990.00')
							WHEN COALESCE(a."IsScoreExist", 0) = 0 AND COALESCE(B."IsScoreExist", 0) = 1 AND (POSITION('.' IN COALESCE(a."getScore100", '0')) > 0 OR POSITION('.' IN COALESCE(b."getScore100", '0')) > 0)
								THEN TO_CHAR(ROUND(CAST(COALESCE(B."getScore100", '0') AS NUMERIC), 2), 'FM999999990.00')
							WHEN COALESCE(a."IsScoreExist", 0) = 1 AND COALESCE(B."IsScoreExist", 0) = 1 AND POSITION('.' IN COALESCE(a."getScore100", '0')) = 0 AND POSITION('.' IN COALESCE(b."getScore100", '0')) = 0
								THEN TO_CHAR(ROUND(CAST(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(B."getScore100", '0') AS FLOAT)) / 2) AS NUMERIC), 0), 'FM999999990')
							WHEN COALESCE(a."IsScoreExist", 0) = 1 AND COALESCE(B."IsScoreExist", 0) = 0 AND POSITION('.' IN COALESCE(a."getScore100", '0')) = 0 AND POSITION('.' IN COALESCE(b."getScore100", '0')) = 0
								THEN TO_CHAR(ROUND(CAST(COALESCE(a."getScore100", '0') AS NUMERIC), 0), 'FM999999990')
							WHEN COALESCE(a."IsScoreExist", 0) = 0 AND COALESCE(B."IsScoreExist", 0) = 1 AND POSITION('.' IN COALESCE(a."getScore100", '0')) = 0 AND POSITION('.' IN COALESCE(b."getScore100", '0')) = 0
								THEN TO_CHAR(ROUND(CAST(COALESCE(B."getScore100", '0') AS NUMERIC), 0), 'FM999999990')
							ELSE '0'
						END AS getScore100,
							CASE
							WHEN a."GradeSet" IS NOT NULL AND a."GradeSet" = 4.00 THEN '4.0'
							WHEN a."GradeSet" IS NOT NULL AND a."GradeSet" = 3.50 THEN '3.5'
							WHEN a."GradeSet" IS NOT NULL AND a."GradeSet" = 3.00 THEN '3.0'
							WHEN a."GradeSet" IS NOT NULL AND a."GradeSet" = 2.50 THEN '2.5'
							WHEN a."GradeSet" IS NOT NULL AND a."GradeSet" = 2.00 THEN '2.0'
							WHEN a."GradeSet" IS NOT NULL AND a."GradeSet" = 1.50 THEN '1.5'
							WHEN a."GradeSet" IS NOT NULL AND a."GradeSet" = 1.00 THEN '1.0'
							WHEN a."GradeSet" IS NOT NULL AND a."GradeSet" = 0.00 THEN '0.0'
							WHEN b."GradeSet" IS NOT NULL AND b."GradeSet" = 4.00 THEN '4.0'
							WHEN b."GradeSet" IS NOT NULL AND b."GradeSet" = 3.50 THEN '3.5'
							WHEN b."GradeSet" IS NOT NULL AND b."GradeSet" = 3.00 THEN '3.0'
							WHEN b."GradeSet" IS NOT NULL AND b."GradeSet" = 2.50 THEN '2.5'
							WHEN b."GradeSet" IS NOT NULL AND b."GradeSet" = 2.00 THEN '2.0'
							WHEN b."GradeSet" IS NOT NULL AND b."GradeSet" = 1.50 THEN '1.5'
							WHEN b."GradeSet" IS NOT NULL AND b."GradeSet" = 1.00 THEN '1.0'
							WHEN b."GradeSet" IS NOT NULL AND b."GradeSet" = 0.00 THEN '0.0'
							WHEN a."nTermSubLevel2" IS NULL AND COALESCE(a."getSpecial", '') = '-1' AND (COALESCE(a."getScore100", '') = '' OR COALESCE(a."getScore100", '') = '0' OR COALESCE(a."getScore100", '') = '0.0') AND COALESCE(a."getgradelabel", '') != ''
								AND b."nTermSubLevel2" IS NULL AND COALESCE(b."getSpecial", '') = '-1' AND (COALESCE(b."getScore100", '') = '' OR COALESCE(b."getScore100", '') = '0' OR COALESCE(b."getScore100", '') = '0.0') AND COALESCE(b."getgradelabel", '') != ''
								THEN CASE WHEN (CAST(COALESCE(b."getgradelabel", '0') AS FLOAT) >= CAST(COALESCE(a."getgradelabel", '0') AS FLOAT)) THEN b."getgradelabel" ELSE a."getgradelabel" END
							WHEN COALESCE(a."getSpecial", '') = '-1' AND COALESCE(a."IsScoreExist", 0) = 1 AND COALESCE(b."getSpecial", '') = '-1' AND COALESCE(b."IsScoreExist", 0) = 1 AND (POSITION('.' IN COALESCE(a."getScore100", '0')) > 0 OR POSITION('.' IN COALESCE(b."getScore100", '0')) > 0)
								THEN CASE
									WHEN CAST(TO_CHAR(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2), 'FM999999990.00') AS NUMERIC) > 79.99 THEN '4.0'
									WHEN CAST(TO_CHAR(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2), 'FM999999990.00') AS NUMERIC) > 74.99 THEN '3.5'
									WHEN CAST(TO_CHAR(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2), 'FM999999990.00') AS NUMERIC) > 69.99 THEN '3.0'
									WHEN CAST(TO_CHAR(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2), 'FM999999990.00') AS NUMERIC) > 64.99 THEN '2.5'
									WHEN CAST(TO_CHAR(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2), 'FM999999990.00') AS NUMERIC) > 59.99 THEN '2.0'
									WHEN CAST(TO_CHAR(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2), 'FM999999990.00') AS NUMERIC) > 54.99 THEN '1.5'
									WHEN CAST(TO_CHAR(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2), 'FM999999990.00') AS NUMERIC) > 49.99 THEN '1.0'
									ELSE '0'
								END
							WHEN COALESCE(a."getSpecial", '') = '-1' AND COALESCE(a."IsScoreExist", 0) = 1 AND COALESCE(b."getSpecial", '') = '-1' AND COALESCE(b."IsScoreExist", 0) = 1
								THEN CASE
									WHEN ROUND(CAST(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2) AS NUMERIC), 0) > 79.99 THEN '4.0'
									WHEN ROUND(CAST(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2) AS NUMERIC), 0) > 74.99 THEN '3.5'
									WHEN ROUND(CAST(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2) AS NUMERIC), 0) > 69.99 THEN '3.0'
									WHEN ROUND(CAST(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2) AS NUMERIC), 0) > 64.99 THEN '2.5'
									WHEN ROUND(CAST(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2) AS NUMERIC), 0) > 59.99 THEN '2.0'
									WHEN ROUND(CAST(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2) AS NUMERIC), 0) > 54.99 THEN '1.5'
									WHEN ROUND(CAST(((CAST(COALESCE(a."getScore100", '0') AS FLOAT) + CAST(COALESCE(b."getScore100", '0') AS FLOAT)) / 2) AS NUMERIC), 0) > 49.99 THEN '1.0'
									ELSE '0'
								END
							WHEN COALESCE(a."getSpecial", '') = '-1' AND COALESCE(a."IsScoreExist", 0) = 1 AND (COALESCE(b."getSpecial", '') = '-1' AND COALESCE(b."IsScoreExist", 0) = 0 OR COALESCE(b."getSpecial", '') = '')
								THEN a."getgradelabel"
							WHEN (COALESCE(a."getSpecial", '') = '-1' AND COALESCE(a."IsScoreExist", 0) = 0 OR COALESCE(a."getSpecial", '') = '') AND COALESCE(b."getSpecial", '') = '-1' AND COALESCE(b."IsScoreExist", 0) = 1
								THEN b."getgradelabel"
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '1' THEN 'ร'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '2' THEN 'มส'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '3' THEN 'มก'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '4' THEN 'ผ'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '5' THEN 'มผ'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '6' THEN 'อื่นๆ'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '7' THEN 'ขร'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '8' THEN 'ขส'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '9' THEN 'ท'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '10' THEN 'ดีเยี่ยม'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '11' THEN 'ดี'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '12' THEN 'พอใช้'
							WHEN b."getSpecial" IS NOT NULL AND b."getSpecial" = '13' THEN 'ปรับปรุง'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '1' THEN 'ร'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '2' THEN 'มส'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '3' THEN 'มก'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '4' THEN 'ผ'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '5' THEN 'มผ'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '6' THEN 'อื่นๆ'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '7' THEN 'ขร'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '8' THEN 'ขส'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '9' THEN 'ท'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '10' THEN 'ดีเยี่ยม'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '11' THEN 'ดี'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '12' THEN 'พอใช้'
							WHEN b."getSpecial" IS NULL AND a."getSpecial" IS NOT NULL AND a."getSpecial" = '13' THEN 'ปรับปรุง'
							ELSE a."getgradelabel"
						END AS getgradelabel,
								COALESCE(a."ActualNCredit", b."ActualNCredit") nCredit,
								COALESCE(a."GradeSet", b."GradeSet") GradeSet,
								COALESCE(a."CourseGroupName", b."CourseGroupName") CourseGroupName,
								COALESCE(a."nStudentNumber", b."nStudentNumber") nStudentNumber,
								CASE WHEN (a."getSpecial" is null or a."getSpecial" = '-1') AND b."getSpecial" is not null THEN b."getSpecial" ELSE a."getSpecial" END getSpecial,
								a."nOrder" CourseTypeOrder,
								a."SortNumber" SortNumber

							from (select * from tmp_studentgradeinfo k  where k."sTerm" = '1') a
							full outer join (select * from tmp_studentgradeinfo k where k."sTerm" = '2') b on a."sID" = b."sID"
							AND a."CourseCode" = b."CourseCode" AND a."CourseName" = b."CourseName"
)
,tmp_StudentGradeInfo1 AS
(select    C."sid", C."sstudentid", C."ngradeid",C."splaneid",C."nterm",C."nterm2" nterm2, C."ntsublevel", C."ntermsublevel2",C."nyear",
					C."sterm" sTerm1, C."sterm2", C."roomname",
					C."coursecode", C."coursename", C."coursetype",C."coursegroup",C."coursetotalhour",C."coursestatus", C."coursehour",
					C."firstname", C."lastname", C."titledesc",
					C."term1score", C."term2score",   C."getscore100"::text getscore100,C."getgradelabel",
		C."ncredit",
		CASE
		WHEN C."getscore100" is not null AND C."gradeset" is null AND C."getspecial" = '-1' THEN  CAST(C."getgradelabel" as double precision) * C."ncredit"
		WHEN C."getscore100" is not null AND C."gradeset" is null AND (C."getspecial" = '4' or C."getspecial" = '10') THEN  4 * C."ncredit"
		WHEN C."getscore100" is not null AND C."gradeset" is null AND C."getspecial" = '11' THEN  3 * C."ncredit"
		WHEN C."getscore100" is not null AND C."gradeset" is null AND C."getspecial" = '12' THEN  2 * C."ncredit"
		WHEN C."getscore100" is not null AND C."gradeset" is null AND C."getspecial" = '13' THEN  1 * C."ncredit"
		WHEN C."getscore100" is null AND C."gradeset" is null AND C."getspecial" = '-1' THEN CAST(C."getgradelabel" as double precision) * C."ncredit"
		WHEN C."getscore100" is null AND C."gradeset" is null AND (C."getspecial" = '4' or C."getspecial" = '10') THEN  4 * C."ncredit"
		WHEN C."getscore100" is null AND C."gradeset" is null AND C."getspecial" = '11' THEN  3 * C."ncredit"
		WHEN C."getscore100" is null AND C."gradeset" is null AND C."getspecial" = '12' THEN  2 * C."ncredit"
		WHEN C."getscore100" is null AND C."gradeset" is null AND C."getspecial" = '13' THEN  1 * C."ncredit"
		WHEN C."gradeset" is not null AND C."gradeset" = '4.00' THEN  4 * C."ncredit"
		WHEN C."gradeset" is not null AND C."gradeset" = '3.50' THEN  3.5 * C."ncredit"
		WHEN C."gradeset" is not null AND C."gradeset" = '3.00' THEN  3 * C."ncredit"
		WHEN C."gradeset" is not null AND C."gradeset" = '2.50' THEN  2.5 * C."ncredit"
		WHEN C."gradeset" is not null AND C."gradeset" = '2.00' THEN  2 * C."ncredit"
		WHEN C."gradeset" is not null AND C."gradeset" = '1.50' THEN  1.5 * C."ncredit"
		WHEN C."gradeset" is not null AND C."gradeset" = '1.00' THEN  1 * C."ncredit"
		ELSE 0
		END GradeXNCredit,

		C."getspecial", CAST(COALESCE(null,0)  as double precision) gpa,
		C."coursegroupname", C."nstudentnumber",C."coursetypeorder", C."sortnumber"
	  from tmp_StudentGradeInfoYearly C
		order by C."coursegroup",C."coursetypeorder", COALESCE(C."sortnumber", 999999), C."coursecode"
)
,tmp_StudentGradeInfo2 AS
( select g."sid", g."sstudentid", g."ngradeid",g."splaneid",g."nterm",g."nterm2", g."ntsublevel", g."ntermsublevel2",
		 g."nyear", g."sterm1", g."sterm2", g."roomname",
		g."coursecode", g."coursename", g."coursetype",g."coursegroup",g."coursetotalhour",g."coursestatus", g."coursehour",
		g."firstname", g."lastname", g."titledesc",
		g."term1score", g."term2score", g."getscore100",g."getgradelabel",
		g."ncredit", g."gradexncredit",	g."getspecial",
		TO_CHAR(((coalesce(nullif(r."gpa"::text, '')::double precision, 0) )),'FM999999')::double precision gpa,
		 g."coursetypeorder", g."sortnumber",
		--CASE WHEN (g."getscore100" is not null AND g."getscore100" != '''')
		--THEN TO_CHAR(((coalesce(nullif(g."getscore100"::text, '')::double precision, 0) )/2),'FM999999')
		--ELSE '''' END getscore50
       CASE
    WHEN (g."getscore100" IS NOT NULL AND g."getscore100" != '''')
    THEN
        CASE
            WHEN (COALESCE(NULLIF(g."getscore100"::text, '')::double precision, 0) / 2) =
                 FLOOR(COALESCE(NULLIF(g."getscore100"::text, '')::double precision, 0) / 2)
            THEN TO_CHAR(COALESCE(NULLIF(g."getscore100"::text, '')::double precision, 0) / 2, 'FM999999')
            ELSE TO_CHAR(COALESCE(NULLIF(g."getscore100"::text, '')::double precision, 0) / 2, 'FM999999.00')
        END
    ELSE ''''
END AS getscore50
		from tmp_studentgradeinfo1 g
		LEFT JOIN  (
					     --gpa AND ranking
						select z."sid",sum(z."ncredit") "totalncredit", sum(z."gradexncredit") "totalgadexncredit",
						COALESCE((sum(z."gradexncredit") *4)/ nullif((sum(z."ncredit") * 4), 0), 0) gpa, row_number()
						over(order by COALESCE((sum(z."gradexncredit") *4)/ nullif((sum(z."ncredit") * 4), 0), 0) desc,z."nstudentnumber") ranking,z."nterm"
						from tmp_studentgradeinfo1 z
						where "coursegroupname" != 'กิจกรรมพัฒนาผู้เรียน'
						AND "coursegroupname" != 'รายวิชาเสริมไม่คิดหน่วยกิต'
						GROUP BY z."sid", z."nterm",z."nstudentnumber"

					 ) r on g."sid" = r."sid" AND g."nterm" = r."nterm"
		order by g."coursegroup", g."coursetypeorder", COALESCE(g."sortnumber", 999999), g."coursecode"
)
 select * from tmp_StudentGradeInfo2;
END IF;
END;
$function$
