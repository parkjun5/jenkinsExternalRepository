package com.selab.springbootblueprints.service.impl;

import com.github.mreutegg.laszip4j.LASHeader;
import com.github.mreutegg.laszip4j.LASPoint;
import com.github.mreutegg.laszip4j.LASReader;
import com.selab.springbootblueprints.exception.UserGroupNotFoundException;
import com.selab.springbootblueprints.model.bean.DataSources;
import com.selab.springbootblueprints.model.bean.NcDataSource;
import com.selab.springbootblueprints.model.entity.*;
import com.selab.springbootblueprints.model.entity.projection.UserGroupVO;
import com.selab.springbootblueprints.model.entity.projection.UserPageableInfoVO;
import com.selab.springbootblueprints.model.entity.projection.UserVO;
import com.selab.springbootblueprints.repository.CesiumEntityRepository;
import com.selab.springbootblueprints.repository.NcDataFileEntityRepository;
import com.selab.springbootblueprints.service.UserService;
import com.selab.springbootblueprints.exception.UserNameValidationException;
import com.selab.springbootblueprints.exception.UserPasswordValidationException;
import com.selab.springbootblueprints.model.bean.Auth;
import com.selab.springbootblueprints.model.bean.UserDetailsImpl;
import com.selab.springbootblueprints.repository.UserGroupRepository;
import com.selab.springbootblueprints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ucar.ma2.*;
import ucar.nc2.*;

import java.io.*;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = {Exception.class})
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserGroupRepository userGroupRepository;
    private final PasswordEncoder passwordEncoder;
    private final CesiumEntityRepository cesiumEntityRepository;
    private final NcDataFileEntityRepository ncDataFileEntityRepository;

    private final double SAMPLE_SIZE = 1e6;
    private final  double EPSILON = 1e-4;

    private static final String DEFAULT_USER_GROUP_NAME = "None";

    @Override
    public void addUser(String name, String password, String groupName)
            throws UserNameValidationException, UserPasswordValidationException, UserGroupNotFoundException {

        if (!User.isValidName(name)) {
            throw new UserNameValidationException(String.format("User name is not valid {name:%s}", name));
        } else if (!User.isValidPassword(password)) {
            throw new UserPasswordValidationException();
        }

        Optional<UserGroup> groupOptional = userGroupRepository.findByName(groupName);
        if (groupOptional.isEmpty()) {
            throw new UserGroupNotFoundException(String.format("Not found user group(name:%s)", groupName));
        }

        String encryptionPassword = passwordEncoder.encode(password);
        userRepository.save(new User(name, encryptionPassword, groupOptional.get()));
    }

    @Override
    public void addUser(String name, String password) throws UserNameValidationException, UserPasswordValidationException {
        addUser(name, password, DEFAULT_USER_GROUP_NAME);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserVO> getUser(long id) {
        return userRepository.findUserVoById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isExist(String username) {

        return userRepository.findByUsername(username)
                .isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserPageableInfoVO> getAllUserList(Pageable pageable) {
        return userRepository.findAllBy(pageable);
    }

    @Override
    public void update(long id, String groupName) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Optional<UserGroup> userGroupOptional = userGroupRepository.findByName(groupName);
            if (userGroupOptional.isPresent()) {
                user.setUserGroup(userGroupOptional.get());
            } else {
                log.error(String.format("user group field update fail: userGroup(name:%s) not found", groupName));
            }

            userRepository.save(user);
        } else {
            log.error(String.format("user update fail: user(id:%s) not found", id));
        }
    }

    @Override
    public void changePassword(long id, String password) throws UserPasswordValidationException {
        if (!User.isValidPassword(password)) {
            throw new UserPasswordValidationException("password is not valid");
        }

        String encryptedPassword = passwordEncoder.encode(password);
        userRepository.updatePassword(id, encryptedPassword);
    }

    @Override
    public void removeUser(long id) {
        userRepository.deleteById(id);
    }

    @Override   // for security.core.userdetails.UserDetailsService
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User userEntity = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(String.format("User name not found (name: %s)", username)));

        Auth[] auths = userEntity.getUserGroup()
                .getUserGroupAuthList()
                .stream()
                .map(UserGroupAuth::getAuth)
                .toArray(Auth[]::new);

        return new UserDetailsImpl(userEntity, auths);
    }

    @Override
    public void disableUser(long id) {
        userRepository.updateEnabled(id, false);
    }

    @Override
    public void enableUser(long id) {
        userRepository.updateEnabled(id, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserGroupVO> getUserGroupList() {
        return userGroupRepository.findAllBy();
    }

    @Override
    public List<Cesiumentity> addDATA() {
//        Path path = Paths.get("D:\\mapDatas\\resultWIND.txt");
//        List<Cesiumentity> resultList = new ArrayList<>();
//        String content;
//        try {
//            content = Files.readString(path);
//            for (String eachContent : content.split("\r\n")) {
//                List<Double> splitFloats = Arrays.stream(eachContent.split(" ")).map(data -> {
//                    double result;
//                    try {
//                        result = Double.parseDouble(data);
//                    } catch (NumberFormatException e) {
//                        result = 0.0;
//                    }
//                    return result;
//                }).collect(Collectors.toList());
//
//                if (splitFloats.size() != 4 || splitFloats.get(3) == 0.0) {
//                    continue;
//                }
//                    resultList.add(Cesiumentity.builder()
//                            .longitude(splitFloats.get(0))
//                            .latitude(splitFloats.get(1))
//                            .height(splitFloats.get(2))
//                            .value(splitFloats.get(3))
//                            .build());
//
//            }
//        } catch (IOException e) {
//            log.debug(e.getMessage());
//        }
//
//        cesiumEntityRepository.saveAll(resultList);

        return cesiumEntityRepository.findAll();
    }

    @Override
    public void getCdmFromNcFile() {
        LASReader lasReader = new LASReader(new File("D:\\LAS\\Tile_+003_+005.las"));
        LASHeader header = lasReader.getHeader();
        Iterable<LASPoint> points = lasReader.getPoints();
        Iterator<LASPoint> eachPoint = points.iterator();
        while (eachPoint.hasNext()) {
            LASPoint point = eachPoint.next();
            String temp = point.toString();
        }



        String str = lasReader.toString();
        try (NetcdfFile ncfile = NetcdfFiles.open("C:\\ncDataFolder\\RDR_R3D_KMA_WD_202104022130.nc")) {
            // Do cool stuff here
//            NetcdfDataset temp = NetcdfDatasets.openDataset("C:\\ncDataFolder\\RDR_R3D_KMA_WD_202104022130.nc");
//            log.info("hi cdm");
//            GridDataset gds = ucar.nc2.dt.grid.GridDataset.open("C:\\ncDataFolder\\RDR_R3D_KMA_WD_202104022130.nc");
//            GridDatatype grid = gds.findGridDatatype("myVariableName");
//            GridCoordSystem gcs = grid.getCoordinateSystem();
//            Object tmep = gcs.getCoordinateAxes();
//            Object tmep2 = gcs.getCoordinateTransforms();
//            ProjectionImpl proj = gcs.getProjection();
//            Variable vr = ncfile.findVariable("x");
//            Variable vr2 = ncfile.findVariable("y");
//            Array data1 = vr.read();
//            Array data2 = vr2.read();
//
//            int[] shape1 = data1.getShape();
//            int[] shape2 = data2.getShape();
//
//            Index index = data1.getIndex();
//            Index index2 = data2.getIndex();
//
//            double dval;
//            double dval2;
//
//            for (int j = 0; j < shape2[0]; j++) {
//                for (int i = 0; i < shape1[0]; i++) {
//                    dval = data1.getDouble(index.set(i));
//                    dval2 = data2.getDouble(index2.set(j));
//                    System.out.println(dval + " " + dval2 + " " + proj.projToLatLon(dval, dval2).getLatitude() + "  " + proj.projToLatLon(dval, dval2).getLongitude());
//                }
//            }

            Variable uComponentVariable = ncfile.findVariable("u_component");
            Variable vComponentVariable = ncfile.findVariable("v_component");
            Number dataMinusShort =  Objects.requireNonNull(ncfile.findGlobalAttribute("data_minus")).getNumericValue();
            Number dataScaleShort = Objects.requireNonNull(ncfile.findGlobalAttribute("data_scale")).getNumericValue();
            Number dataOutShort = Objects.requireNonNull(ncfile.findGlobalAttribute("data_out")).getNumericValue();

            double dataMinus = convertNumberToDouble(dataMinusShort);
            double dataScale = convertNumberToDouble(dataScaleShort);
            double dataOut = convertNumberToDouble(dataOutShort);

            assert uComponentVariable != null;
            ArrayShort.D3 uData = (ArrayShort.D3)uComponentVariable.read();

            assert vComponentVariable != null;
            ArrayShort.D3 vData = (ArrayShort.D3) uComponentVariable.read();
            int[] shape = uData.getShape();
            List<List<Double>> results = new ArrayList<>();

            for (int i = 0; i < shape[0]; i++) {
                List<Double>  eachBender = new ArrayList<>();

                for (int j = 0; j < shape[1]; j++) {
                    for (int k = 0; k < shape[2]; k++) {
                        double uComponentValue = uData.get(i, j, k);
                        double calculatedUComValue = (uComponentValue - dataMinus)/dataScale;
                        double vComponentValue = vData.get(i, j, k);
                        double calculatedVComValue = (vComponentValue - dataMinus)/dataScale;
                        double result = Math.sqrt(Math.pow(calculatedUComValue, 2) + Math.pow(calculatedVComValue, 2));
                        if (result == dataOut) {
                            result = -999.9;
                        }
                        eachBender.add(result);
                    }
                }
                results.add(eachBender);
            }

            log.info("##############결과######################");
            log.info(String.valueOf(results));

//            String vArrayStr = Ncdump.printArray(vDatas, "data", null);

        } catch (IOException ioe) {
            // Handle less-cool exceptions here
            log.error(ioe.getMessage());
        }
    }

    @Override
    public Object readJson() {

        Object ob = null;
        try {
            ob = new JSONParser().parse(new FileReader("C:\\ncDataFolder\\ncJson.json"));
        } catch (IOException | ParseException e) {
            e.printStackTrace();
        }
        return ob;
    }

    @Override
    public List<NcDataSource> callNcDataList() {
        List<Ncdatafile> ncDataFiles = ncDataFileEntityRepository.findAll();

        return ncDataFiles.stream().map( data ->
             NcDataSource.builder()
                    .position(new double[]{ data.getLon(), data.getLat(), data.getHeight()})
                    .normal(new double[]{ data.getLon(), data.getLat(), data.getHeight()})
                    .color(new int[]{ data.getR(), data.getG(), data.getB()})
                    .build()
        ).collect(Collectors.toList());
    }

    public void makeJsonFile() {
        Path path = Paths.get("D:\\mapDatas\\WIS_WND_KOREA_202105041620_py_layer_56.txt");
        List<DataSources> dataSources =  new ArrayList<>();

        try {
            BufferedWriter bw = new BufferedWriter(new FileWriter("D:\\mapDatas\\windResult_2022_02_10.csv", true));
            String content = Files.readString(path);

            for (String temp : content.split("\r\n")) {
                String[] making = temp.split(" ");
                double lon = Double.parseDouble(making[0]);
                double lat = Double.parseDouble(making[1]);
                int[] color = {72, 149, 210};
                if (lon >= 126 && lon < 127 && lat >= 37 && lat < 38) {
//                    var dim = Math.sqrt(SAMPLE_SIZE);
//                    if (making[3].equals("nan")) {} else {sb.append(making[3]);}
                    dataSources.add(new DataSources(getPosition(lon, lat), getNormal(lon, lat), color));
                }

            }

            FileWriter file = new FileWriter("c:/ncDataFolder/ncJson.json");
            file.write(dataSources.toString());
            file.flush();
            file.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public double convertNumberToDouble(Number number) {
        double converted = -999.9;
        if( number != null) {
            converted = number.doubleValue();
        }
        return converted;
    }

    public double[] getPosition(double u, double v) {
        double positionX = (u - 1/2) * Math.PI * 2;
        double positionY = (v - 1/2) * Math.PI * 2;
        double positionZ = surfaceEquation(positionX, positionY);
        return new double[]{roundBingMapPoint(positionX), roundBingMapPoint(positionY), roundBingMapPoint(positionZ)};
    }

    public String[] getNormal(double u, double v) {
        double[] p0 = getPosition(u - EPSILON, v - EPSILON);
        double[] p1 = getPosition(u + EPSILON, v + EPSILON);
        DecimalFormat df = new DecimalFormat("0.00000");

        double positionX = (p1[1] - p0[1]) * (p1[2] - p0[2]);
        double positionY = (p1[2] - p0[2]) * (p1[0] - p0[0]);
        double positionZ = (p1[0] - p0[0]) * (p1[1] - p0[1]);
        return new String[]{df.format(positionX), df.format(positionY), df.format(positionZ)};
    }

    public double surfaceEquation(double x, double y) {
        return Math.sin(x * x + y * y) * x / Math.PI;
    }

    public double roundBingMapPoint (double coordinate) {
        return Math.ceil(coordinate * 100000) / 100000;
    }

}
