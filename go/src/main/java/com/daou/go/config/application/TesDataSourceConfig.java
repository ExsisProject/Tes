package com.daou.go.config.application;

import com.daou.go.common.properties.TesDBProperties;
import com.mchange.v2.c3p0.ComboPooledDataSource;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.beans.PropertyVetoException;

import static com.daou.go.core.component.SecurityHelper.decrypt;


@Slf4j
@Configuration
@EnableTransactionManagement
public class TesDataSourceConfig {
    private static final int MINUTE_5 = 300;

    protected static final Logger logger = LoggerFactory.getLogger(TesDataSourceConfig.class);

    @Autowired
    TesDBProperties tesDBProp;

    @Bean(destroyMethod = "close", name = "TesDataSouce")
    public DataSource customERPDataSource() {

        try {
            ComboPooledDataSource pool = new ComboPooledDataSource();
            pool.setDriverClass(tesDBProp.getDriver());
            pool.setJdbcUrl(getTesJdbcUrl());
            pool.setUser(decrypt(tesDBProp.getUsername()));
            pool.setPassword(decrypt(tesDBProp.getPassword()));
            pool.setInitialPoolSize(tesDBProp.getInitialPoolSize());
            pool.setMinPoolSize(tesDBProp.getMinPoolSize());
            pool.setMaxPoolSize(tesDBProp.getMaxPoolSize());
            // Idle Connection Test : in 5 min
            pool.setIdleConnectionTestPeriod(MINUTE_5);
            pool.setPreferredTestQuery("SELECT 1 FROM DUAL");
            pool.setCheckoutTimeout(tesDBProp.getCheckoutTimeout());
            pool.setUnreturnedConnectionTimeout(tesDBProp.getUnreturnedConnectionTimeout());
            return pool;
        } catch (PropertyVetoException pve) {
            throw new DataSourceConfigException(pve);
        }
    }

    @Bean(name = "ERPJdbcTemplate")
    @Autowired
    public NamedParameterJdbcTemplate jdbcTemplateERP(@Qualifier("TesDataSouce") DataSource dataSource) {
        NamedParameterJdbcTemplate jdbcTemplate = new NamedParameterJdbcTemplate(dataSource);
        return jdbcTemplate;
    }

    /**
     * mssql jdbc의 경우 최종 URL은 다음과 같음. db명은 생략 가능.<br>
     * jdbc:sqlserver://호스트:포트;DatabaseName=db명
     *
     * @return
     */
    private String getTesJdbcUrl() {
        StringBuffer url = new StringBuffer();

        url.append(tesDBProp.getProtocol());
        url.append("://");
        url.append(tesDBProp.getHost());
        url.append(':');
        url.append(tesDBProp.getPort());
        url.append(";");
        url.append(";DatabaseName=");
        url.append(tesDBProp.getDbName());

        return url.toString();
    }
}
