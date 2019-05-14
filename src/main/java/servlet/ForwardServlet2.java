package servlet;


import com.alibaba.fastjson.JSON;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpStatus;
import org.apache.http.StatusLine;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.*;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author JawnWu
 */
public class ForwardServlet2 extends HttpServlet {
    private String preFix = "http://127.0.0.1:5556";

    private static final Logger logger = LoggerFactory.getLogger(ForwardServlet2.class);

    /**
     * 下载测试报告请求
     */
    private static final String URL_TYPE_CHART = "chart";

    /**
     * 下载交易报文请求
     */
    private static final String URL_TYPE_DOWNLOAD = "download";

    @Override
    public void init() throws ServletException {
        super.init();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ClientProtocolException, IOException, ServletException {
        //1.获取uri
        //2.获取请求参数
        //3.拼接url
        //4.HttpGeturl的设置
        //5.发送请求，
        //6.接受响应
        //7.返回响应

        //.拼接url
        String url = getUrl(req);
        logger.info("开始get请求:" + url);
        //3.HttpGeturl的设置
        HttpGet httpGet = new HttpGet(url);
        addHeader(httpGet, req);
        if (url.indexOf(URL_TYPE_CHART) > 0 || url.indexOf(URL_TYPE_DOWNLOAD) > 0) {
            fileDownloadRequest(resp, httpGet);
        } else {
            //发送请求
            sendRequest(resp, httpGet);
        }
        logger.info("get请求结束:" + url);
    }

    /**
     * post请求
     *
     * @param req
     * @param resp
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //1.请求参数的获取
        //2.url的获取
        //3.http post url的设置
        //4.http post 头部的设置
        //5.http 请求体额设置
        //httpclient 请求
        //6.HTTP响应
        //判断是普通POST请求还是文件上传POST请求
        if (ServletFileUpload.isMultipartContent(req)) {
            try {
                /*List<FileItem> multiparts = new ServletFileUpload(
                        new DiskFileItemFactory()).parseRequest(req);*/
                ServletFileUpload upload = new ServletFileUpload(new DiskFileItemFactory());
                // 指定单个上传文件的最大尺寸,单位:字节，这里设为10Mb
                upload.setFileSizeMax(10 * 1024 * 1024);
                upload.setHeaderEncoding("UTF-8");

                List<FileItem> multiparts = upload.parseRequest(req);
                MultipartEntityBuilder builder = MultipartEntityBuilder.create();
                HttpEntity reqEntity = null;
                for (FileItem item : multiparts) {
                    InputStream inputStream = item.getInputStream();
                    //获取文件名称
                    String fileName = item.getName();
                    if (fileName != null) {
                        builder.addBinaryBody("file", inputStream, ContentType.MULTIPART_FORM_DATA, fileName);
                        builder.addTextBody("fileName", fileName);
                        reqEntity = builder.build();
                    }
                }
                String url = getUrl(req);
                //3.http post url的设置
                HttpPost httppost = new HttpPost(url);
                addHeader(httppost, req);
                httppost.setEntity(reqEntity);
                //发送请求
                sendRequest(resp, httppost);
            } catch (FileUploadException e) {
                e.printStackTrace();
            }
            /*
            SAXBuilder saxbuilder = new SAXBuilder();
            Document document = saxbuilder.build(inputStream);
            System.out.println("xml:"+new XMLOutputter().outputString(document));
            Element rootElem = document.getRootElement();
            List<Element> childElemList = rootElem.getChildren();
            for (Element element : childElemList) {
                System.out.println(element);
            }*/
        } else {
            //1.请求参数的获取
            ServletInputStream stream = req.getInputStream();
            //2.url的获取
            String url = getUrl(req);

            logger.info("开始post请求:" + url);
            //3.http post url的设置
            HttpPost httppost = new HttpPost(url);
            addHeader(httppost, req);

            //4.http post 头部的设置
            httppost.setHeader("Accept", "application/json");
            httppost.addHeader("Content-type", "application/json; charset=utf-8");
            //5.http 请求体额设置
            HttpEntity entity = new InputStreamEntity(stream);

            httppost.setEntity(entity);
            //httpclient 请求
            sendRequest(resp, httppost);

            logger.info("post请求结束:" + url);
        }


    }

    /**
     * put 请求
     *
     * @param req
     * @param resp
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        //1.请求参数的获取
        //2.url的获取
        //3.http put url的设置
        //4.http put 头部的设置
        //5.http 请求体额设置
        //httpclient 请求
        //6.HTTP响应

        //1.请求参数的获取
        ServletInputStream stream = req.getInputStream();
        //2.url的获取
        String url = getUrl(req);

        logger.info("开始put请求:" + url);
        //3.http put url的设置
        HttpPut httpput = new HttpPut(url);
        addHeader(httpput, req);

        //4.http post 头部的设置
        httpput.setHeader("Accept", "application/json");
        httpput.addHeader("Content-type", "application/json; charset=utf-8");

        //5.http 请求体额设置
        HttpEntity entity = new InputStreamEntity(stream);


        httpput.setEntity(entity);

        //httpclient 请求
        sendRequest(resp, httpput);

        System.out.println(">>>>>>>>>>>>put请求" + url + "结束");
        logger.info("put请求结束:" + url);
    }

    /**
     * delete 请求
     *
     * @param req
     * @param resp
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        //1.获取uri
        //2.获取请求参数
        //3.拼接url
        //4.HttpDelete的设置
        //5.发送请求，
        //6.接受响应
        //7.返回响应

        //.拼接url
        String url = getUrl(req);

        logger.info("开始delete请求:" + url);
        //3.HttpDelete的设置
        HttpDelete httpDelete = new HttpDelete(url);
        addHeader(httpDelete, req);
        //发送请求
        sendRequest(resp, httpDelete);

        logger.info("delete请求结束:" + url);

    }


    /**
     * 拼接url
     *
     * @param req
     * @return
     */
    private String getUrl(HttpServletRequest req) {
        //1.获取uri
        //2.获取请求参数
        //3.拼接url
        String uri = req.getRequestURI();

        System.out.println("uri1" + uri);

        String queryStr = req.getQueryString();

        if (queryStr != null && queryStr.length() > 0) {

            uri = preFix + uri.split("/microservice")[1] + "?" + queryStr;

        } else {

            uri = preFix + uri.split("/microservice")[1];
        }

        System.out.println("uri" + uri + req.getQueryString());

        return uri;
    }

    /**
     * 发送请求
     *
     * @param resp
     * @param httpMethod
     * @throws IOException
     * @throws ClientProtocolException
     */
    private void sendRequest(HttpServletResponse resp, HttpRequestBase httpMethod) throws ClientProtocolException, IOException {
        CloseableHttpClient httpclient = HttpClients.createDefault();

        CloseableHttpResponse response = null;

        try {
            response = httpclient.execute(httpMethod);
            /*HttpEntity httpEntity = response.getEntity();
            Header header = httpEntity.getContentType();*/

            //6.HTTP响应
            //返回转码
            resp.setCharacterEncoding("UTF-8");

            Writer writer = resp.getWriter();

            StatusLine status = response.getStatusLine();

            System.out.println("响应" + JSON.toJSONString(response) + status);

            int state = status.getStatusCode();

            if (state == HttpStatus.SC_OK) {
                HttpEntity responseEntity = response.getEntity();

                String jsonString = EntityUtils.toString(responseEntity);

                System.out.println("jsonString" + jsonString  );

                writer.write(jsonString);


            } else if (state == HttpStatus.SC_UNAUTHORIZED) {
                HttpEntity responseEntity = response.getEntity();

                String jsonString = EntityUtils.toString(responseEntity);
                System.out.println("jsonString" + jsonString );
                resp.setStatus(401);
                writer.write(jsonString);
            } else {
                Map map = new HashMap<String, Object>(16);
                map.put("status", state);
                map.put("code", "error");
                map.put("message", "请求失败");
                writer.write(JSON.toJSONString(map));
            }

        } finally {
            if (response != null) {
                try {
                    response.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            try {
                httpclient.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 发送请求-文件下载
     *
     * @param resp
     * @param httpMethod
     * @throws IOException
     * @throws ClientProtocolException
     */
    private void fileDownloadRequest(HttpServletResponse resp, HttpRequestBase httpMethod) throws IOException {
        CloseableHttpClient httpclient = HttpClients.createDefault();

        CloseableHttpResponse response = null;

        try {

            response = httpclient.execute(httpMethod);

            StatusLine status = response.getStatusLine();

            logger.info("下载响应:" + JSON.toJSONString(response));
            logger.info("status:" + status);
            int state = status.getStatusCode();

            if (state == HttpStatus.SC_OK) {
                //4、获取实体
                HttpEntity httpEntity = response.getEntity();
                //获取头信息内容
                Header[] headers = response.getAllHeaders();
                for (Header header : headers) {
                    if ("Content-Disposition".equals(header.getName().toString()) ||
                            "Content-Type".equals(header.getName().toString())) {
                        resp.setHeader(header.getName().toString(), header.getValue().toString());
                    }
                }
                resp.setCharacterEncoding("utf-8");

                //获取内容
                InputStream in = httpEntity.getContent();

                OutputStream out = resp.getOutputStream();

                //可以根据实际情况调整，建议使用1024，即每次读1KB
                byte[] bt = new byte[1024];
                int len ;
                while ((len = in.read(bt)) != -1) {
                    //建议不要直接用os.write(bt)
                    out.write(bt, 0, len);
                }
                out.flush();

                in.close();

                out.close();
            } else {
                resp.setStatus(404);
            }

        } finally {
            if (response != null) {
                try {
                    response.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            try {
                httpclient.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 设置请求头
     *
     * @param httpMethod
     * @param req
     */
    private void addHeader(HttpRequestBase httpMethod, HttpServletRequest req) {
        httpMethod.addHeader("accessToken", req.getHeader("accessToken"));
    }
}
