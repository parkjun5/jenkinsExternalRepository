package com.selab.springbootblueprints.controller;

import com.selab.springbootblueprints.exception.UserNameValidationException;
import com.selab.springbootblueprints.exception.UserPasswordValidationException;
import com.selab.springbootblueprints.model.bean.CesiumEntity;
import com.selab.springbootblueprints.model.bean.NcDataSource;
import com.selab.springbootblueprints.model.bean.PostUserResponseStatus;
import com.selab.springbootblueprints.model.entity.Cesiumentity;
import com.selab.springbootblueprints.model.entity.Ncdatafile;
import com.selab.springbootblueprints.service.UserService;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Controller
public class IndexController {

    @Setter(onMethod_ = @Autowired)
    private UserService userService;

    @RequestMapping("/")
    public String getRoot(Model model) {
//        Path path = Paths.get("D:\\mapDatas\\resultWIND.txt");
//        String content = null;
//        List<CesiumEntity> resultList = new ArrayList<>();
//        try {
//            content = Files.readString(path);
//            for (String eachContent : content.split("\r\n")) {
//                List<Double> splitFloats = Arrays.stream(eachContent.split(" ")).map(data -> {
//                    double result;
//                    try{
//                        result = Double.parseDouble(data);
//                    }catch(NumberFormatException e){
//                        result = 0.0;
//                    }
//                    return result;
//                }).collect(Collectors.toList());
//                if (splitFloats.size() != 4 ) {
//                    continue;
//                } else if (splitFloats.get(3) == 0.0) {
//                    continue;
//                }
//                resultList.add( CesiumEntity.builder()
//                        .longitude(splitFloats.get(0))
//                        .latitude(splitFloats.get(1))
//                        .height(splitFloats.get(2))
//                        .value(splitFloats.get(3))
//                        .build());
//            }
//        } catch (IOException e) {
//            log.debug(e.getMessage());
//        }
//
//
//        for (Cesiumentity data : resultList) {
//            var color = Cesium.Color.TRANSPARENT;
//            if( data.getValue() > 20) {
//                color = Cesium.Color.ORANGE.withAlpha(0.5);
//            } else if (data.getValue()> 15) {
//                color = Cesium.Color.WHITE.withAlpha(0.3);
//            } else if (data.getValue() > 10) {
//                color = Cesium.Color.ORANGE.withAlpha(0.2);
//            } else {
//                color = Cesium.Color.TRANSPARENT;
//            }
//            Object temp = {
//                    "name": "바람장 데이터",
//                    "value": data.toString(),
//            "description": `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
//            position: Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height),
//                    box: {
//                dimensions: new Cesium.Cartesian3(1025.0, 1025.0, 50.0),
//                        material: color,
//            },
//            });
//        }
//        List<Cesiumentity> resultList = userService.addDATA();

//        userService.getCdmFromNcFile();

        List<NcDataSource> resultList = userService.callNcDataList();
//        Object resultList = userService.readJson();
        model.addAttribute("resultList", resultList);
        return "temp";
    }

    @GetMapping("/newData")
    public void newDataSave() {
        userService.addDATA();
    }

    @GetMapping("/register")
    public void getSignUp() {

    }

    @ResponseBody
    @PostMapping("/register")
    public ResponseEntity<PostUserResponseStatus> postUser(String username, String password) {
        PostUserResponseStatus resultValue = PostUserResponseStatus.OK;

        try {
            userService.addUser(username, password);
        } catch (UserNameValidationException e) {
            resultValue = PostUserResponseStatus.NAME_NOT_VALID;
        } catch (UserPasswordValidationException e) {
            resultValue = PostUserResponseStatus.PASSWORD_NOT_VALID;
        }

        return resultValue.equals(PostUserResponseStatus.OK) ?
                new ResponseEntity<>(resultValue, HttpStatus.CREATED) : new ResponseEntity<>(resultValue, HttpStatus.OK);
    }
}
