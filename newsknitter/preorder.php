<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>News Knitter</title>
<link href="css/oneColFixCtrHdr.css" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="css/thickbox.css" type="text/css" media="screen" />
<script type="text/javascript" src="js/jquery.js">
</script>
<script type="text/javascript" src="js/thickbox.js">
</script>
<script type="text/javascript">
	function isValidEMailAddress(email) { if(!email) return false; var pattern = /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.(?:[A-Z]{2}|com|org|net|biz|info|name|aero|jobs|museum)$/i; return (email.replace(/ /g,"") != "" && email.match(pattern) == email) }
	function checkForm()
	{
		var errors = new Array();
		if(!isValidEMailAddress(document.nkPreorder.Email.value))
			errors.push("Invalid E-Mail adress!");

		var patternSelected = false;
		for(var i=0; i<document.nkPreorder.Pattern.length; ++i)
			if(document.nkPreorder.Pattern[i].checked)
				patternSelected = true;
		if(!patternSelected)
			errors.push("No pattern selected!");

		var sizeSelected = false;
		for(var i=0; i<document.nkPreorder.size.length; ++i)
			if(document.nkPreorder.size[i].checked)
				sizeSelected = true;
		if(!sizeSelected)
			errors.push("No size selected!");

		if(errors.length)
		{
			alert(errors.join("\n"));
			return false;
		}
		return true;
	}
</script>
</head>
<body class="oneColFixCtrHdr">
<div id="container">
  <div id="header">
    <div id="bookmark"> <a href="http://del.icio.us/post?url=http://casualdata.com/newsknitter/&amp;title=Newsknitter" title="Bookmark at Del.icio.us!" rel="nofollow"><img src="gfx/delicious.png" width="17" height="16" /></a> <a href="http://digg.com/submit?phase=2&amp;url=http://casualdata.com/newsknitter/&amp;title=Newsknitter" title="Digg it!" rel="nofollow"><img src="gfx/digg.png" width="17" height="16" /></a> <a href="http://www.stumbleupon.com/submit?url=http://casualdata.com/newsknitter/&amp;title=Newsknitter" title="Submit to Stumbleupon!" rel="nofollow"><img src="gfx/su.png" width="17" height="16" /></a></div>
    <a href="index.html"><img src="gfx/nk.gif" alt="Newsknitter" width="214" height="75" border="0" /></a>
    <a href="index.html"><img src="gfx/banner.jpg" width="680" height="200" border="0" /></a>
    <!-- end #header -->
  </div>
  <div id="mainContent">
<?php
if(isset($_POST["Submit"]))
{
	$order = "\"".date("d.m.Y H:i:s")."\"\t\"".trim($_POST["Name"])."\"\t\"".trim($_POST["Surname"])."\"\t\"".trim($_POST["Email"])."\"\t\"".trim($_POST["country"])."\"\t\"".implode(",",$_POST["Pattern"])."\"\t\"".trim($_POST["gender"])."\"\t\"".trim($_POST["size"])."\"\r\n";
	$fp = fopen("nk_preorder.txt", "a");
	fwrite($fp,$order,strlen($order));
	fclose($fp);
?>
<h2 class="red">Thanks!</h2>
<p>Thanks for filling out the form. You are now recorded into our database and you will be notified via e-mail when the sweaters are ready to purchase. You may go back to the <a href="index.html">main page</a>.</p>
<?php
}
else
{
?>
    <form id="nk-preorder" name="nkPreorder" method="post" action="preorder.php" onsubmit="return checkForm()">
       <h2 class="red">Hello Everybody!</h2>
      <p>After getting a lot of positive feedback from the community, we are now working on producing more News Knitter sweaters. A limited number of them are in preparation to be on sale! If you desire to have one, please fill in the information form below. </p>
      <p>&nbsp;</p>      
      <ul><li>You will be notified via e-mail when the sweaters are ready to purchase.</li>
		  <li>Unfortunately, we can not provide any information about the pricing at the moment, so you will not enter into any obligations by filling out this form.</li>
		  <li>The information you provide is not going to be shared by some other companies or used for any other purposes.</li>
      </ul>
<p>&nbsp;</p>
<p>&nbsp;</p>
      <h2 class="blue">Personal Info</h2>
      <div id="Personal">
        <div class="formleft">
          <p><strong>Name&nbsp;&nbsp;:&nbsp;&nbsp;</strong>
            <input name="Name" type="text" size="25" maxlength="50" value="" />
          </p>
        </div>
        <div class="formright">
          <p><strong>Surname&nbsp;:&nbsp;&nbsp;</strong>
            <input name="Surname" type="text" size="25" maxlength="50" value="" />
          </p>
        </div>
        <div class="formleft">
          <p><strong>E-mail&nbsp;:&nbsp;&nbsp;</strong>
            <input name="Email" type="text" size="25" maxlength="100" value="" />
          </p>
        </div>
        <div class="formright">
          <p><strong>Country&nbsp;&nbsp;:&nbsp;&nbsp;</strong>
            <!-- start of drop down country selection list -->
            <select name="country" size="1">
              <option>Afghanistan</option>
              <option>&Aring;land Islands</option>
              <option>Albania</option>
              <option>Algeria</option>
              <option>American Samoa</option>
              <option>Andorra</option>
              <option>Angola</option>
              <option>Anguilla</option>
              <option>Antarctica</option>
              <option>Antigua and Barbuda</option>
              <option>Argentina</option>
              <option>Armenia</option>
              <option>Aruba</option>
              <option>Australia</option>
              <option>Austria</option>
              <option>Azerbaijan</option>
              <option>Bahamas</option>
              <option>Bahrain</option>
              <option>Bangladesh</option>
              <option>Barbados</option>
              <option>Belarus</option>
              <option>Belgium</option>
              <option>Belize</option>
              <option>Benin</option>
              <option>Bermuda</option>
              <option>Bhutan</option>
              <option>Bolivia</option>
              <option>Bosnia and Herzegovina</option>
              <option>Botswana</option>
              <option>Bouvet Island</option>
              <option>Brazil</option>
              <option>British Indian Ocean territory</option>
              <option>Brunei Darussalam</option>
              <option>Bulgaria</option>
              <option>Burkina Faso</option>
              <option>Burundi</option>
              <option>Cambodia</option>
              <option>Cameroon</option>
              <option>Canada</option>
              <option>Cape Verde</option>
              <option>Cayman Islands</option>
              <option>Central African Republic</option>
              <option>Chad</option>
              <option>Chile</option>
              <option>China</option>
              <option>Christmas Island</option>
              <option>Cocos (Keeling) Islands</option>
              <option>Colombia</option>
              <option>Comoros</option>
              <option>Congo</option>
              <option>Congo, Democratic Republic</option>
              <option>Cook Islands</option>
              <option>Costa Rica</option>
              <option>C&ocirc;te d'Ivoire</option>
              <option>Croatia (Hrvatska)</option>
              <option>Cuba</option>
              <option>Cyprus</option>
              <option>Czech Republic</option>
              <option>Denmark</option>
              <option>Djibouti</option>
              <option>Dominica</option>
              <option>Dominican Republic</option>
              <option>East Timor</option>
              <option>Ecuador</option>
              <option>Egypt</option>
              <option>El Salvador</option>
              <option>Equatorial Guinea</option>
              <option>Eritrea</option>
              <option>Estonia</option>
              <option>Ethiopia</option>
              <option>Falkland Islands</option>
              <option>Faroe Islands</option>
              <option>Fiji</option>
              <option>Finland</option>
              <option>France</option>
              <option>French Guiana</option>
              <option>French Polynesia</option>
              <option>French Southern Territories</option>
              <option>Gabon</option>
              <option>Gambia</option>
              <option>Georgia</option>
              <option>Germany</option>
              <option>Ghana</option>
              <option>Gibraltar</option>
              <option>Greece</option>
              <option>Greenland</option>
              <option>Grenada</option>
              <option>Guadeloupe</option>
              <option>Guam</option>
              <option>Guatemala</option>
              <option>Guinea</option>
              <option>Guinea-Bissau</option>
              <option>Guyana</option>
              <option>Haiti</option>
              <option>Heard and McDonald Islands</option>
              <option>Honduras</option>
              <option>Hong Kong</option>
              <option>Hungary</option>
              <option>Iceland</option>
              <option>India</option>
              <option>Indonesia</option>
              <option>Iran</option>
              <option>Iraq</option>
              <option>Ireland</option>
              <option>Israel</option>
              <option>Italy</option>
              <option>Jamaica</option>
              <option>Japan</option>
              <option>Jordan</option>
              <option>Kazakhstan</option>
              <option>Kenya</option>
              <option>Kiribati</option>
              <option>Korea (north)</option>
              <option>Korea (south)</option>
              <option>Kuwait</option>
              <option>Kyrgyzstan</option>
              <option>Lao People's Democratic Republic</option>
              <option>Latvia</option>
              <option>Lebanon</option>
              <option>Lesotho</option>
              <option>Liberia</option>
              <option>Libyan Arab Jamahiriya</option>
              <option>Liechtenstein</option>
              <option>Lithuania</option>
              <option>Luxembourg</option>
              <option>Macao</option>
              <option>Macedonia<</option>
              <option>Madagascar</option>
              <option>Malawi</option>
              <option>Malaysia</option>
              <option>Maldives</option>
              <option>Mali</option>
              <option>Malta</option>
              <option>Marshall Islands</option>
              <option>Martinique</option>
              <option>Mauritania</option>
              <option>Mauritius</option>
              <option>Mayotte</option>
              <option>Mexico</option>
              <option>Micronesia</option>
              <option>Moldova</option>
              <option>Monaco</option>
              <option>Mongolia</option>
              <option>Montserrat</option>
              <option>Morocco</option>
              <option>Mozambique</option>
              <option>Myanmar</option>
              <option>Namibia</option>
              <option>Nauru</option>
              <option>Nepal</option>
              <option>Netherlands</option>
              <option>Netherlands Antilles</option>
              <option>New Caledonia</option>
              <option >New Zealand</option>
              <option>Nicaragua</option>
              <option>Niger</option>
              <option>Nigeria</option>
              <option>Niue</option>
              <option>Norfolk Island</option>
              <option>Northern Mariana Islands</option>
              <option>Norway</option>
              <option>Oman</option>
              <option>Pakistan</option>
              <option>Palau</option>
              <option>Palestinian Territories</option>
              <option>Panama</option>
              <option>Papua New Guinea</option>
              <option>Paraguay</option>
              <option>Peru</option>
              <option>Philippines</option>
              <option>Pitcairn</option>
              <option>Poland</option>
              <option>Portugal</option>
              <option>Puerto Rico</option>
              <option>Qatar</option>
              <option>R&eacute;union</option>
              <option>Romania</option>
              <option>Russian Federation</option>
              <option>Rwanda</option>
              <option>Saint Helena</option>
              <option>Saint Kitts and Nevis</option>
              <option>Saint Lucia</option>
              <option>Saint Pierre and Miquelon</option>
              <option>Saint Vincent and the Grenadines</option>
              <option>Samoa</option>
              <option>San Marino</option>
              <option>Sao Tome and Principe</option>
              <option>Saudi Arabia</option>
              <option>Senegal</option>
              <option>Serbia and Montenegro</option>
              <option>Seychelles</option>
              <option>Sierra Leone</option>
              <option>Singapore</option>
              <option>Slovakia</option>
              <option>Slovenia</option>
              <option>Solomon Islands</option>
              <option>Somalia</option>
              <option>South Africa</option>
              <option>Spain</option>
              <option>Sri Lanka</option>
              <option>Sudan</option>
              <option>Suriname</option>
              <option>Svalbard and Jan Mayen Islands</option>
              <option>Swaziland</option>
              <option>Sweden</option>
              <option>Switzerland</option>
              <option>Syria</option>
              <option>Taiwan</option>
              <option>Tajikistan</option>
              <option>Tanzania</option>
              <option>Thailand</option>
              <option>Togo</option>
              <option>Tokelau</option>
              <option>Tonga</option>
              <option>Trinidad and Tobago</option>
              <option>Tunisia</option>
              <option>Turkey</option>
              <option>Turkmenistan</option>
              <option>Turks and Caicos Islands</option>
              <option>Tuvalu</option>
              <option>Uganda</option>
              <option>Ukraine</option>
              <option>United Arab Emirates</option>
              <option >United Kingdom</option>
              <option  selected="selected">United States of America</option>
              <option>Uruguay</option>
              <option>Uzbekistan</option>
              <option>Vanuatu</option>
              <option>Vatican City</option>
              <option>Venezuela</option>
              <option>Vietnam</option>
              <option>Virgin Islands (British)</option>
              <option>Virgin Islands (US)</option>
              <option>Wallis and Futuna Islands</option>
              <option>Western Sahara</option>
              <option>Yemen</option>
              <option>Zaire</option>
              <option>Zambia</option>
              <option>Zimbabwe</option>
            </select>
            <!-- end of drop down country selection list -->
          </p>
        </div>
      </div>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <h2 class="blue">Sweater Preferences</h2>
      <div id="Pattern">
        <p><strong>Pattern</strong> (You can make multiple selections):</p>
        <div><img src="gfx/pattern/pattern1.jpg" alt="Daily Typographic" />
          <input name="Pattern[]" type="checkbox" id="Pattern" value="D1" />
        </div>
        <div><img src="gfx/pattern/pattern2.jpg" alt="Daily Graphics" />
          <input name="Pattern[]" type="checkbox" id="Pattern" value="D2" />
        </div>
        <div><img src="gfx/pattern/pattern3.jpg" alt="Thematic Plus" />
          <input name="Pattern[]" type="checkbox" id="Pattern" value="T1" />
        </div>
        <div><img src="gfx/pattern/pattern4.jpg" alt="Thematic Bars" />
          <input name="Pattern[]" type="checkbox" id="Pattern" value="T2" />
        </div>
      </div>
      <p>&nbsp;</p>
      <div id="Gender" class="formleft">
        <p><strong>Gender :&nbsp;&nbsp;</strong>
          <input type="radio" name="gender" id="Gender" value="Male" />
          <label>Male</label>
          <input type="radio" name="gender" id="Gender" value="Female" />
          <label>Female</label>
        </p>
      </div>
      <div id="Size" class="formleft">
        <p><strong>Size &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;</strong>
          <input type="radio" name="size" id="Size" value="S" />
          <label>Small</label>
          <input type="radio" name="size" id="Size" value="M" />
          <label>Medium</label>
          <input type="radio" name="size" id="Size" value="L" />
          <label>Large</label>
          <input type="radio" name="size" id="Size" value="XL" />
          <label>XL</label>
        </p>
        <p>&nbsp;</p>
        <input name="Submit" type="submit" value="Submit" class="submit"/>
      </div>
      <p>&nbsp;</p>
    </form>
<?php } ?>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
  </div>
  <div id="footer">
    <p>Ebru Kurbak &amp; Mahir Yavuz, &copy; 2007-2008<br />
    </p>
    <!-- end #footer -->
  </div>
  <!-- end #container -->
</div>
</body>
</html>
