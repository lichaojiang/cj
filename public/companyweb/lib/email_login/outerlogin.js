function checkInput()
{var b=document.form1.uin,a=document.form1.pwd;if(0==b.value.length){b.focus();return false;}if(0==a.value.length){a.focus();return false;}document.form1.submit();setTimeout(" document.form1.pwd.value = '' ",500);return false;}

function writeLoginPanel(b)
{
  if(!b||!b.domainlist||-1==b.domainlist.indexOf("."))
    {return;}
  var e='return checkInput()',
      c='<div id="divLoginpanelHor" class="bizmail_loginpanel" style="width:550px;"><div class="bizmail_LoginBox"><form name="form1" action="https://exmail.qq.com/cgi-bin/login" target="_blank" method="post" onsubmit="'+e+'"><input type="hidden" name="firstlogin" value="false" /><input type="hidden" name="errtemplate" value="dm_loginpage" /><input type="hidden" name="aliastype" value="other" /><input type="hidden" name="dmtype" value="bizmail" /><input type="hidden" name="p" value="" /><label>\u5E10\u53F7:</label><input type="text" name="uin" class="text" value="" />@#domainlist#<label>&nbsp;\u5BC6\u7801:</label><input type="password" name="pwd" class="text" value="" /><input type="submit" class="" name="" value="\u767B\u5F55" />&nbsp;<a href="https://exmail.qq.com/cgi-bin/readtemplate?check=false&t=bizmail_orz" target="_blank">\u5FD8\u8BB0\u5BC6\u7801\uFF1F</a></form></div></div>',d='<div id="divLoginpanelVer" class="bizmail_loginpanel"><div class="bizmail_LoginBox"><form name="form1" action="https://exmail.qq.com/cgi-bin/login" target="_blank" method="post" onsubmit="'+e+'"><input type="hidden" name="firstlogin" value="false" /><input type="hidden" name="errtemplate" value="dm_loginpage" /><input type="hidden" name="aliastype" value="other" /><input type="hidden" name="dmtype" value="bizmail" /><input type="hidden" name="p" value="" /><div class="bizmail_column"><label>\u5E10\u53F7:</label><div class="bizmail_inputArea"><input type="text" name="uin" class="text" value="" />@#domainlist#</div></div><div class="bizmail_column"><label>\u5BC6\u7801:</label><div class="bizmail_inputArea"><input type="password" name="pwd" class="text" value="" /></div></div><div class="bizmail_SubmitArea"><input type="submit" class="" name="" style="width:66px;" value="\u767B\u5F55" /><a href="https://exmail.qq.com/cgi-bin/readtemplate?check=false&t=bizmail_orz" target="_blank">\u5FD8\u8BB0\u5BC6\u7801\uFF1F</a></div></form></div></div>';
  var g=b.domainlist.split(";");
  if(g.length==1)
  {
    var a='<span>#domain#</span><input type="hidden" name="domain" value="#domain#" />';
    var f=a.replace(/#domain#/g,g[0]);
  }
  else
  {
    var f='<select name="domain">';
    for(i=0;i<g.length;i++)
    {f+='<option value="'+g[i]+'">'+g[i]+'</option>';}
    f+='</select>';
  }
  if(!b.mode||b.mode=="vertical"||b.mode=="both")
    {document.write(d.replace(/#domainlist#/g,f));}
  if(b.mode=="horizontal"||b.mode=="both")
    {document.write(c.replace(/#domainlist#/g,f));}
}
